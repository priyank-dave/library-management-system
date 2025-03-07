"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext"; // Import AuthContext

const Login = () => {
  const { loginUser, loginWithGoogle } = useAuth(); // Use AuthContext
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle JWT Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginUser(form.email, form.password); // Use context function
      router.push("/"); // Redirect after login
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login Success
  const handleGoogleSuccess = async (response) => {
    try {
      await loginWithGoogle(response.credential); // Use context function
      router.push("/"); // Redirect after Google login
    } catch (error) {
      setError("Google login failed. Try again.");
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex h-screen">
        {/* Left: Image Section */}
        <div className="w-1/2 hidden lg:block relative bg-[var(--primary-color)]">
          <Image
            src="/library-illustration.webp"
            alt="Library Illustration"
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </div>

        {/* Right: Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
          <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-6">
            Login to Your Account
          </h2>

          {error && <p className="text-red-500">{error}</p>}

          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            />

            <button
              type="submit"
              className="w-full bg-[var(--primary-color)] text-white py-2 rounded-lg hover:opacity-90 transition"
              disabled={loading}
            >
              {loading ? "Logging In..." : "Login"}
            </button>
          </form>

          {/* Google Login */}
          <div className="mt-4 w-full max-w-md">
            <div className="flex justify-center mt-2">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Login Failed")}
              />
            </div>
          </div>

          {/* Don't have an account? */}
          <p className="mt-4 text-[var(--secondary-color)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[var(--primary-color)] font-medium"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
