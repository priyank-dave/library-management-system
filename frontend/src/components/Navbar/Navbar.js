"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Moon, Sun, Menu, X } from "lucide-react";

const Navbar = () => {
  const [theme, setTheme] = useState("mocha");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "mocha";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "mocha" ? "latte" : "mocha";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <nav className="bg-[var(--ctp-surface0)] shadow-md px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo/site-logo.webp"
            alt="Library Logo"
            width={45}
            height={45}
          />
          <span className="text-[var(--ctp-text)] text-xl font-bold">
            LibRead
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors duration-300 
             bg-[var(--ctp-surface1)] hover:bg-[var(--ctp-subtext0)] 
             flex items-center justify-center cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "mocha" ? (
              <Sun className="text-[var(--ctp-yellow)]" size={24} />
            ) : (
              <Moon className="text-[var(--ctp-blue)]" size={24} />
            )}
          </button>

          <Link
            href="/login"
            className="bg-[var(--ctp-green)] text-[var(--ctp-base)] px-5 py-2 rounded-lg hover:bg-[var(--ctp-blue)] hover:text-[var(--ctp-base)] transition duration-300 font-semibold"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="bg-[var(--ctp-green)] text-[var(--ctp-base)] px-5 py-2 rounded-lg hover:bg-[var(--ctp-blue)] hover:text-[var(--ctp-base)] transition duration-300 font-semibold"
          >
            Signup
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg transition-colors duration-300 bg-[var(--ctp-surface1)] hover:bg-[var(--ctp-subtext)]"
        >
          {menuOpen ? (
            <X size={24} className="text-[var(--ctp-text)]" />
          ) : (
            <Menu size={24} className="text-[var(--ctp-text)]" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col items-center gap-4 mt-4 pb-4 border-t border-[var(--ctp-subtext)]">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors duration-300 bg-[var(--ctp-surface1)] hover:bg-[var(--ctp-subtext)]"
            aria-label="Toggle Theme"
          >
            {theme === "mocha" ? (
              <Sun className="text-[var(--ctp-yellow)]" size={24} />
            ) : (
              <Moon className="text-[var(--ctp-blue)]" size={24} />
            )}
          </button>

          <Link
            href="/login"
            className="w-full text-center bg-[var(--ctp-green)] text-[var(--ctp-base)] px-5 py-2 rounded-lg hover:bg-[var(--ctp-blue)] hover:text-[var(--ctp-base)] transition duration-300 font-semibold"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="w-full text-center bg-[var(--ctp-green)] text-[var(--ctp-base)] px-5 py-2 rounded-lg hover:bg-[var(--ctp-blue)] hover:text-[var(--ctp-base)] transition duration-300 font-semibold"
          >
            Signup
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
