"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const AdminLogin = () => {
  const { login } = useAuth(); // Use the unified login function
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle Admin Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form.email, form.password, true); // Pass 'true' for admin login
      router.push("/admin/dashboard"); // Redirect to admin dashboard
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Right: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
        <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-6">
          Admin Login
        </h2>

        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Admin Email Address"
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

        {/* Not an Admin? */}
        <p className="mt-4 text-[var(--secondary-color)]">
          Not an admin?{" "}
          <Link
            href="/login"
            className="text-[var(--primary-color)] font-medium"
          >
            User Login
          </Link>
        </p>
      </div>

      {/* Left: Image Section */}
      <div className="w-1/2 hidden lg:block relative bg-[var(--primary-color)]">
        <Image
          src="/admin-illustration.webp"
          alt="Admin Login Illustration"
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
      </div>
    </div>
  );
};

export default AdminLogin;
