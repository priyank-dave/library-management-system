"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react"; // Importing the Book Open icon

const Navbar = () => {
  return (
    <nav className="bg-[var(--bg-light)] border-b border-[var(--border-color)] shadow-md">
      <div className="container mx-auto flex justify-between items-center px-6 py-3">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            className="text-xl font-bold text-[var(--primary-color)] flex items-center gap-2 border-[1px] border-[var(--primary-color)] px-3 py-1 rounded-lg"
          >
            <BookOpen className="w-6 h-6 text-[var(--primary-color)]" />{" "}
            {/* Open Book Icon */}
            Aspire LMS
          </Link>
        </div>

        {/* Right: Login & Signup */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)] hover:text-[var(--text-white)] transition"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)] hover:text-[var(--text-white)] transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
