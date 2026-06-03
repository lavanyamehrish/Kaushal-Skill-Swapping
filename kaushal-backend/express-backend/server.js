// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const crypto = require('crypto');

// ✅ Firebase Admin initialization with environment variables (Railway compatible)
const requiredEnvVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please set the following in your .env or Railway environment:');
  console.error('  - FIREBASE_PROJECT_ID');
  console.error('  - FIREBASE_CLIENT_EMAIL');
  console.error('  - FIREBASE_PRIVATE_KEY');
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
  console.log('✅ Firebase Admin initialized successfully with environment variables');
  console.log('✅ Project ID:', process.env.FIREBASE_PROJECT_ID);
} catch (err) {
  console.error('❌ Failed to initialize Firebase Admin:', err.message);
  process.exit(1);
}

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

/** Helper: convert level string to numeric rank */
function levelRank(level) {
  if (!level) return 0;
  level = level.toString().toLowerCase();
  if (level.includes('expert') || level.includes('advanced')) return 3;
  if (level.includes('intermediate') || level.includes('inter')) return 2;
  if (level.includes('beginner') || level.includes('basic')) return 1;
  return 0;
}

/**
 * Improved matchMaker: find reciprocal matches for a user
 * - User A offers X and wants Y
 * - User B offers Y and wants X
 * - Creates bidirectional matches with detailed logging
 */
async function matchMaker(uid) {
  console.log(`\n🔍 Starting matchMaker for user: ${uid}`);
  
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  
  if (!userSnap.exists) {
    console.log('❌ User not found');
    return { createdMatches: 0 };
  }

  const user = userSnap.data();
  const myOffer = user.offer || null;
  const myWant = user.want || null;

  console.log('📊 My Profile:');
  console.log('  Offer:', myOffer);
  console.log('  Want:', myWant);

  if (!myOffer || !myWant || !myOffer.skillId || !myWant.skillId) {
    console.log('❌ Incomplete profile - missing offer or want');
    return { createdMatches: 0 };
  }

  // Find candidates who offer what I want
  console.log(`\n🔎 Searching for users who offer: ${myWant.skillId}`);
  const candidatesSnap = await db.collection('users')
    .where('offer.skillId', '==', myWant.skillId)
    .get();

  console.log(`📋 Found ${candidatesSnap.size} potential candidates`);

  const createdMatches = [];

  for (const doc of candidatesSnap.docs) {
    const candId = doc.id;
    
    if (candId === uid) {
      console.log(`⏭️  Skipping self`);
      continue;
    }

    const candData = doc.data();
    const candWant = candData.want || null;
    const candOffer = candData.offer || null;

    console.log(`\n👤 Checking candidate: ${candId}`);
    console.log('  Their offer:', candOffer);
    console.log('  Their want:', candWant);

    if (!candWant || !candOffer || !candWant.skillId || !candOffer.skillId) {
      console.log('  ❌ Incomplete profile');
      continue;
    }

    // Check reciprocal: Do they want what I offer?
    if (candWant.skillId !== myOffer.skillId) {
      console.log(`  ❌ Not reciprocal: They want ${candWant.skillId}, I offer ${myOffer.skillId}`);
      continue;
    }

    console.log('  ✅ Reciprocal match found!');

    // Level compatibility check
    const candOfferRank = levelRank(candOffer.level);
    const myWantRank = levelRank(myWant.level);
    const myOfferRank = levelRank(myOffer.level);
    const candWantRank = levelRank(candWant.level);

    console.log('  📊 Level check:');
    console.log(`    They offer ${candOffer.level} (${candOfferRank}), I want ${myWant.level} (${myWantRank})`);
    console.log(`    I offer ${myOffer.level} (${myOfferRank}), they want ${candWant.level} (${candWantRank})`);

    if (candOfferRank < myWantRank) {
      console.log('  ❌ Their skill level too low for what I want');
      continue;
    }
    if (myOfferRank < candWantRank) {
      console.log('  ❌ My skill level too low for what they want');
      continue;
    }

    console.log('  ✅ Level compatibility passed!');

    // Check for existing match (both directions)
    const e1 = await db.collection('matches')
      .where('userA', '==', uid)
      .where('userB', '==', candId)
      .limit(1)
      .get();
    
    const e2 = await db.collection('matches')
      .where('userA', '==', candId)
      .where('userB', '==', uid)
      .limit(1)
      .get();

    if (!e1.empty || !e2.empty) {
      console.log('  ⚠️  Match already exists');
      continue;
    }

    // Create match!
    console.log('  🎉 Creating match!');
    const matchRef = db.collection('matches').doc();
    const now = admin.firestore.FieldValue.serverTimestamp();
    
    const matchData = {
      userA: uid,
      userB: candId,
      status: 'pending',
      createdAt: now,
      score: 1.0,
      skills: {
        userAOffers: myOffer,
        userAWants: myWant,
        userBOffers: candOffer,
        userBWants: candWant
      }
    };

    const batch = db.batch();
    batch.set(matchRef, matchData);

    // Create notifications for both users
    const n1 = db.collection('notifications').doc();
    const n2 = db.collection('notifications').doc();
    
    batch.set(n1, {
      userId: uid,
      type: 'new_match',
      payload: { matchId: matchRef.id, otherUser: candId },
      read: false,
      createdAt: now
    });
    
    batch.set(n2, {
      userId: candId,
      type: 'new_match',
      payload: { matchId: matchRef.id, otherUser: uid },
      read: false,
      createdAt: now
    });

    await batch.commit();
    
    console.log(`  ✅ Match created: ${matchRef.id}`);
    createdMatches.push({ matchId: matchRef.id, userA: uid, userB: candId });
  }

  console.log(`\n✨ Total matches created: ${createdMatches.length}\n`);
  return { createdMatches: createdMatches.length };
}

/**
 * POST /api/user - Create or update user profile
 */
app.post('/api/user', async (req, res) => {
  console.log("🔥 Incoming /api/user", req.body);
  try {
    const payload = req.body;
    if (!payload || !payload.uid) return res.status(400).json({ error: 'uid required in body' });

    const uid = payload.uid;
    const userRef = db.collection('users').doc(uid);

    await userRef.set({
      name: payload.name || null,
      offer: payload.offer || null,
      want: payload.want || null,
      languages: payload.languages || [],
      avgRating: payload.avgRating || null,
      lastActive: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    const result = await matchMaker(uid);

    return res.json({ ok: true, createdMatches: result.createdMatches || 0 });
  } catch (err) {
    console.error('POST /api/user error:', err);
    return res.status(500).json({ error: err.message || err.toString() });
  }
});

/** GET /api/matches/:uid - Get matches for user */
app.get('/api/matches/:uid', async (req, res) => {
  try {
    const uid = req.params.uid;
    if (!uid) return res.status(400).json({ error: 'uid required' });

    const snap = await db.collection('matches').where('userA', '==', uid).get();
    const snap2 = await db.collection('matches').where('userB', '==', uid).get();

    const matches = [];
    snap.forEach(d => matches.push({ id: d.id, ...d.data() }));
    snap2.forEach(d => matches.push({ id: d.id, ...d.data() }));

    return res.json({ ok: true, matches });
  } catch (err) {
    console.error('GET /api/matches error:', err);
    return res.status(500).json({ error: err.message || err.toString() });
  }
});

/** GET /api/health - Health check */
app.get('/api/health', (req, res) => res.json({ ok: true, now: new Date().toISOString() }));

/**
 * POST /api/matches/:matchId/accept
 * ✅ FIXED: Uses Firestore transaction to prevent race conditions
 */
app.post('/api/matches/:matchId/accept', async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: 'uid required' });

    const matchRef = db.collection('matches').doc(matchId);
    
    // Use transaction for atomicity
    const result = await db.runTransaction(async (transaction) => {
      const matchSnap = await transaction.get(matchRef);
      if (!matchSnap.exists) throw new Error('match not found');
      
      const match = matchSnap.data();
      const acceptedBy = match.acceptedBy || [];
      
      // Prevent duplicate acceptance
      if (acceptedBy.includes(uid)) {
        return { ok: true, alreadyAccepted: true, acceptedBy };
      }
      
      // Add this user to acceptedBy
      const updatedAcceptedBy = [...acceptedBy, uid];
      transaction.update(matchRef, { acceptedBy: updatedAcceptedBy });
      
      // Check if both have now accepted
      const bothAccepted = [match.userA, match.userB].every(p => updatedAcceptedBy.includes(p));
      
      if (bothAccepted && !match.sessionId) {
        // Create session atomically in the same transaction
        const sessionRef = db.collection('sessions').doc();
        const now = admin.firestore.FieldValue.serverTimestamp();
        const sessionData = {
          matchId,
          participants: [match.userA, match.userB],
          startedAt: now,
          endedAt: null,
          completedBy: [],
          status: 'in_session',
          createdAt: now
        };
        
        transaction.set(sessionRef, sessionData);
        transaction.update(matchRef, { status: 'in_session', sessionId: sessionRef.id });
        
        // Create notifications in same transaction
        const n1 = db.collection('notifications').doc();
        const n2 = db.collection('notifications').doc();
        transaction.set(n1, {
          userId: match.userA,
          type: 'session_started',
          payload: { sessionId: sessionRef.id, matchId },
          read: false,
          createdAt: now
        });
        transaction.set(n2, {
          userId: match.userB,
          type: 'session_started',
          payload: { sessionId: sessionRef.id, matchId },
          read: false,
          createdAt: now
        });
        
        return { ok: true, sessionCreated: true, sessionId: sessionRef.id };
      }
      
      return { ok: true, acceptedBy: updatedAcceptedBy };
    });

    return res.json(result);
  } catch (err) {
    console.error('POST /api/matches/:matchId/accept error:', err);
    return res.status(500).json({ error: err.message || err.toString() });
  }
});

/**
 * POST /api/sessions/:sessionId/complete
 */
app.post('/api/sessions/:sessionId/complete', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const { uid, completed } = req.body;
    if (!uid) return res.status(400).json({ error: 'uid required' });
    if (!completed) return res.status(400).json({ error: 'completed must be true' });

    const sessionRef = db.collection('sessions').doc(sessionId);
    const sessionSnap = await sessionRef.get();
    if (!sessionSnap.exists) return res.status(404).json({ error: 'session not found' });
    const session = sessionSnap.data();

    await sessionRef.update({
      completedBy: admin.firestore.FieldValue.arrayUnion(uid)
    });

    const updated = (await sessionRef.get()).data();
    const completedBy = updated.completedBy || [];
    const participants = updated.participants || [];

    const bothCompleted = participants.every(p => completedBy.includes(p));
    if (bothCompleted) {
      const now = admin.firestore.FieldValue.serverTimestamp();
      await sessionRef.update({ endedAt: now, status: 'completed' });

      const batch = db.batch();
      const [a, b] = participants;
      const r1 = db.collection('ratingRequests').doc();
      batch.set(r1, {
        sessionId,
        rater: a,
        ratee: b,
        stars: null,
        review: null,
        status: 'pending',
        createdAt: now
      });
      const r2 = db.collection('ratingRequests').doc();
      batch.set(r2, {
        sessionId,
        rater: b,
        ratee: a,
        stars: null,
        review: null,
        status: 'pending',
        createdAt: now
      });

      if (session.matchId) {
        const matchRef = db.collection('matches').doc(session.matchId);
        batch.update(matchRef, { status: 'completed' });
      }

      await batch.commit();

      const nBatch = db.batch();
      participants.forEach(u => {
        const nRef = db.collection('notifications').doc();
        nBatch.set(nRef, {
          userId: u,
          type: 'rating_request',
          payload: { sessionId },
          read: false,
          createdAt: now
        });
      });
      await nBatch.commit();

      return res.json({ ok: true, finalized: true });
    }

    return res.json({ ok: true, completedBy });
  } catch (err) {
    console.error('POST /api/sessions/:sessionId/complete error:', err);
    return res.status(500).json({ error: err.message || err.toString() });
  }
});

/**
 * POST /api/ratings/:ratingRequestId
 */
app.post('/api/ratings/:ratingRequestId', async (req, res) => {
  try {
    const ratingRequestId = req.params.ratingRequestId;
    const { rater, stars, review } = req.body;
    if (!rater || typeof stars !== 'number') return res.status(400).json({ error: 'rater and numeric stars required' });

    const rrRef = db.collection('ratingRequests').doc(ratingRequestId);
    const rrSnap = await rrRef.get();
    if (!rrSnap.exists) return res.status(404).json({ error: 'rating request not found' });
    const rr = rrSnap.data();
    if (rr.rater !== rater) return res.status(403).json({ error: 'only the assigned rater can submit this rating' });
    if (rr.status === 'submitted') return res.status(400).json({ error: 'rating already submitted' });

    const now = admin.firestore.FieldValue.serverTimestamp();

    await rrRef.update({
      stars,
      review: review || null,
      status: 'submitted',
      submittedAt: now
    });

    const ratingRef = db.collection('ratings').doc();
    await ratingRef.set({
      sessionId: rr.sessionId,
      rater,
      ratee: rr.ratee,
      stars,
      review: review || null,
      createdAt: now
    });

    const ratingsSnap = await db.collection('ratings').where('ratee', '==', rr.ratee).get();
    let sum = 0, count = 0;
    ratingsSnap.forEach(s => {
      const d = s.data();
      if (typeof d.stars === 'number') {
        sum += d.stars;
        count++;
      }
    });
    const avg = count ? sum / count : null;
    await db.collection('users').doc(rr.ratee).update({ avgRating: avg });

    return res.json({ ok: true, avgRating: avg });
  } catch (err) {
    console.error('POST /api/ratings/:id error:', err);
    return res.status(500).json({ error: err.message || err.toString() });
  }
});

/**
 * POST /api/matches/:matchId/create-session
 * ✅ FIXED: Uses Firestore transaction to prevent race conditions and UUID for room ID
 */
app.post('/api/matches/:matchId/create-session', async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: 'uid required' });

    const matchRef = db.collection('matches').doc(matchId);
    
    // Use transaction for atomicity
    const result = await db.runTransaction(async (transaction) => {
      const matchSnap = await transaction.get(matchRef);
      if (!matchSnap.exists) throw new Error('match not found');
      
      const match = matchSnap.data();
      
      // Check if user is a participant
      if (![match.userA, match.userB].includes(uid)) {
        throw new Error('Caller not a participant of this match');
      }
      
      // If session already exists, return it
      if (match.sessionId) {
        return { ok: true, sessionId: match.sessionId, alreadyExists: true };
      }
      
      // Create new session with UUID roomID (prevents collisions)
      const roomId = crypto.randomUUID();
      const now = admin.firestore.FieldValue.serverTimestamp();
      
      const sessionRef = db.collection('sessions').doc();
      const sessionData = {
        matchId,
        participants: [match.userA, match.userB],
        roomId,
        startedAt: now,
        endedAt: null,
        status: 'in_session',
        createdAt: now
      };
      
      // Create session and update match atomically
      transaction.set(sessionRef, sessionData);
      transaction.update(matchRef, { status: 'in_session', sessionId: sessionRef.id });
      
      // Create notifications
      const n1 = db.collection('notifications').doc();
      const n2 = db.collection('notifications').doc();
      const notifPayload = {
        type: 'session_created',
        payload: { sessionId: sessionRef.id, roomId },
        read: false,
        createdAt: now
      };
      transaction.set(n1, { userId: match.userA, ...notifPayload });
      transaction.set(n2, { userId: match.userB, ...notifPayload });
      
      return { ok: true, sessionId: sessionRef.id, roomId };
    });

    return res.json(result);
  } catch (err) {
    console.error('POST /api/matches/:matchId/create-session error:', err);
    return res.status(500).json({ error: err.message || err.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Express server listening on port ${PORT}`);
  console.log(`✅ Connected to Firestore project: ${process.env.FIREBASE_PROJECT_ID}`);
});