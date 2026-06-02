const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * Helper: convert level string to numeric rank
 * (beginner=1, intermediate=2, expert=3)
 */
function levelRank(level) {
  if (!level) return 0;
  level = level.toString().toLowerCase();
  if (level.includes('expert')) return 3;
  if (level.includes('intermediate') || level.includes('inter')) return 2;
  if (level.includes('beginner') || level.includes('basic')) return 1;
  return 0;
}

/**
 * Creates a match doc if reciprocal match exists and none already exists.
 * Match condition:
 *  - user.offer.skillId == other.want.skillId
 *  - other.offer.skillId == user.want.skillId
 * Optionally checks level compatibility (offered level >= desired level).
 */
exports.onUserProfileWrite = functions.firestore
  .document('users/{uid}')
  .onWrite(async (change, context) => {
    const uid = context.params.uid;
    const after = change.after.exists ? change.after.data() : null;
    if (!after) {
      console.log('User deleted or no profile; skipping:', uid);
      return null;
    }

    // require both offer and want present (simple MVP)
    const myOffer = after.offer || null; // { skillId, level }
    const myWant = after.want || null;   // { skillId, level }

    if (!myOffer || !myOffer.skillId || !myWant || !myWant.skillId) {
      console.log('Offer or Want missing for', uid, '; skipping match run.');
      return null;
    }

    try {
      // Find candidates whose offer matches this user's want
      const candidatesSnap = await db.collection('users')
        .where('offer.skillId', '==', myWant.skillId)
        .get();

      const createdMatches = [];

      for (const doc of candidatesSnap.docs) {
        const candId = doc.id;
        if (candId === uid) continue; // skip self

        const candData = doc.data();
        const candWant = candData.want || null;
        const candOffer = candData.offer || null;
        if (!candWant || !candOffer || !candWant.skillId || !candOffer.skillId) continue;

        // Check reciprocal: candidate.want.skillId must equal myOffer.skillId
        if (candWant.skillId !== myOffer.skillId) continue;

        // Optional: check level compatibility both ways
        const candOfferRank = levelRank(candOffer.level);
        const myWantRank = levelRank(myWant.level);
        const myOfferRank = levelRank(myOffer.level);
        const candWantRank = levelRank(candWant.level);

        // Require that offered level >= desired level for each side (simple rule)
        if (candOfferRank < myWantRank) {
          console.log(`Candidate ${candId} offers lower level (${candOffer.level}) than user's want (${myWant.level}) — skipping.`);
          continue;
        }
        if (myOfferRank < candWantRank) {
          console.log(`User ${uid} offers lower level (${myOffer.level}) than candidate's want (${candWant.level}) — skipping.`);
          continue;
        }

        // Check if a match between uid and candId already exists
        const existing1 = await db.collection('matches')
          .where('userA', '==', uid)
          .where('userB', '==', candId)
          .limit(1)
          .get();
        const existing2 = await db.collection('matches')
          .where('userA', '==', candId)
          .where('userB', '==', uid)
          .limit(1)
          .get();

        if (!existing1.empty || !existing2.empty) {
          console.log(`Match already exists between ${uid} and ${candId} - skipping creation.`);
          continue;
        }

        // Create match doc
        const matchRef = db.collection('matches').doc();
        const matchData = {
          userA: uid,
          userB: candId,
          status: 'pending', // frontend will show accept/reject UI
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          score: 1.0 // placeholder; you can compute a better score later
        };
        await matchRef.set(matchData);
        createdMatches.push({ matchId: matchRef.id, ...matchData });

        // Create notifications entries (frontend can listen to /notifications)
        const notifications = [
          {
            userId: uid,
            type: 'new_match',
            payload: { matchId: matchRef.id, otherUser: candId },
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          },
          {
            userId: candId,
            type: 'new_match',
            payload: { matchId: matchRef.id, otherUser: uid },
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          }
        ];
        const batch = db.batch();
        notifications.forEach(n => {
          const nRef = db.collection('notifications').doc();
          batch.set(nRef, n);
        });
        await batch.commit();

        console.log(`Created match ${matchRef.id} between ${uid} and ${candId}`);
      } // end for candidates

      console.log('Matching run complete for user', uid, 'createdMatches:', createdMatches.length);
      return { createdMatchesCount: createdMatches.length };
    } catch (err) {
      console.error('Error in matching function for', uid, err);
      throw err;
    }
  });
x