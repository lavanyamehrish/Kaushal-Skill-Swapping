import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      nav("/onboarding");
    } catch (err) {
      setError("Invalid credentials. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
        
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
          Welcome Back
        </h1>
        
        <p className="text-gray-500 text-center mb-6">
          Log in to continue learning and teaching
        </p>

        <form onSubmit={onSubmit} className="space-y-5">

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <div>
            <label className="block text-gray-700 text-sm mb-1">Email</label>
            <input
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1">Password</label>
            <input
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="w-full bg-black text-white py-3 rounded-lg text-lg font-medium hover:bg-gray-900 transition">
            Log in
          </button>

          <p className="text-center text-sm text-gray-600 mt-2">
            New here?{" "}
            <Link className="text-black font-medium underline" to="/signup">
              Create an account
            </Link>
          </p>

        </form>

      </div>
    </div>
  );
}
