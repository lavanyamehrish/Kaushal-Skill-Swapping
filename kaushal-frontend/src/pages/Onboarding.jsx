import { useEffect, useState } from "react";
import { firestore } from "../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import SkillForm from "../components/SkillForm";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Onboarding() {
  const { user } = useAuth();
  const nav = useNavigate();

  const [location, setLocation] = useState("");
  const [language, setLanguage] = useState("");
  const [learn, setLearn] = useState([
    { domain: "", subdomain: "", level: "Beginner" },
  ]);
  const [teach, setTeach] = useState([
    { domain: "", subdomain: "", level: "Intermediate" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load existing Firestore profile
  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(firestore, "users", user.uid));
      if (snap.exists()) {
        const d = snap.data();
        setLocation(d.location || "");
        setLanguage(d.language || "");
        setLearn(d.learnSkills || learn);
        setTeach(d.teachSkills || teach);
      }
    };
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const learnClean = learn.filter((s) => s.domain && s.subdomain);
      const teachClean = teach.filter((s) => s.domain && s.subdomain);

      // Validate that user has at least one skill to learn and one to teach
      if (learnClean.length === 0 || teachClean.length === 0) {
        setError("Please add at least one skill to learn and one skill to teach");
        setLoading(false);
        return;
      }

      // 1. Save onboarding info to Firestore
      await setDoc(
        doc(firestore, "users", user.uid),
        {
          uid: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          location,
          language,
          learnSkills: learnClean,
          teachSkills: teachClean,
          onboardingComplete: true,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // 2. Format payload for backend matching
      const payload = {
        uid: user.uid,
        name: user.displayName || "",
        languages: language ? [language] : [],
        offer: {
          skillId: `${teachClean[0].domain}-${teachClean[0].subdomain}`.toLowerCase(),
          level: teachClean[0].level,
        },
        want: {
          skillId: `${learnClean[0].domain}-${learnClean[0].subdomain}`.toLowerCase(),
          level: learnClean[0].level,
        },
      };

      console.log("📤 Sending to backend:", payload);

      // 3. Send profile to Express backend → run matching
      const result = await api.createOrUpdateUser(payload);
      console.log("✅ Backend response:", result);

      if (result.ok) {
        alert(`Profile saved! Found ${result.createdMatches} potential matches.`);
        // 4. Go to dashboard to see matches
        nav("/");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Complete your profile</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Language (e.g., English, Hindi)"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </div>

        <SkillForm
          title="Skills you want to learn"
          items={learn}
          setItems={setLearn}
        />
        <SkillForm
          title="Skills you can teach"
          items={teach}
          setItems={setTeach}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save & Find Matches"}
        </button>
      </form>
    </div>
  );
}