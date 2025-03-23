"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext"; // Import AuthContext

const Signup = () => {
  const { registerUser, loginWithGoogle } = useAuth(); // Use AuthContext
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle JWT Signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await registerUser(
        form.firstName,
        form.lastName,
        form.email,
        form.password
      ); // Use context function
      router.push("/"); // Redirect after signup
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Signup Success
  const handleGoogleSuccess = async (response) => {
    try {
      await loginWithGoogle(response.credential); // Use context function
      router.push("/"); // Redirect after Google signup
    } catch (error) {
      setError("Google signup failed. Try again.");
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

        {/* Right: Signup Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
          <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-6">
            Create an Account
          </h2>

          {error && <p className="text-red-500">{error}</p>}

          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleChange}
                required
                className="w-1/2 px-4 py-2 border border-[var(--border-color)] rounded-lg"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-1/2 px-4 py-2 border border-[var(--border-color)] rounded-lg"
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg"
            />

            <button
              type="submit"
              className="w-full bg-[var(--primary-color)] text-white py-2 rounded-lg hover:opacity-90 transition"
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Signup;
