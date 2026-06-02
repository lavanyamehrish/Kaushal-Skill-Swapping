import { useState } from "react";
import { auth, firestore } from "../firebase/firebaseConfig"; // ← Changed rtdb to firestore
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      // ✅ Fixed: Using firestore instead of rtdb
      await setDoc(doc(firestore, "users", cred.user.uid), {
        uid: cred.user.uid,
        name,
        email,
        onboardingComplete: false,
        trustScore: 0,
        createdAt: new Date().toISOString(),
      });

      nav("/onboarding");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 border p-6 rounded-xl">
        <h1 className="text-2xl font-semibold">Create account</h1>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input
          className="w-full border p-2 rounded"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-sm">
          Have an account?{" "}
          <Link className="underline" to="/login">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}