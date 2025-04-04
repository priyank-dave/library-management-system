"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, BookOpen, Layers, LogOut } from "lucide-react";

export default function Sidebar({ isOpen }) {
  const { user, logoutUser } = useAuth(); // Get user & logout function

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-[var(--bg-light)] border-r border-[var(--border-color)] shadow-lg transition-all duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-64"
      }`}
    >
      <ul className="text-[var(--text-black)] p-6 space-y-2">
        {/* Dashboard Link */}
        <li>
          <Link
            href="/user/dashboard"
            className="flex items-center gap-3 p-3 hover:bg-[var(--primary-color)] hover:text-white cursor-pointer rounded-md"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
        </li>

        {/* Borrowed Books Link */}
        <li>
          <Link
            href="/user/borrowed-books"
            className="flex items-center gap-3 p-3 hover:bg-[var(--primary-color)] hover:text-white cursor-pointer rounded-md"
          >
            <BookOpen className="w-5 h-5" />
            Borrowed Books
          </Link>
        </li>

        {/* Manage Books Link (Only for Librarians) */}
        {user?.is_librarian && (
          <li>
            <Link
              href="/user/manage-books"
              className="flex items-center gap-3 p-3 hover:bg-[var(--primary-color)] hover:text-white cursor-pointer rounded-md"
            >
              <Layers className="w-5 h-5" />
              Manage Books
            </Link>
          </li>
        )}

        {/* Logout Button */}
        <li>
          <button
            onClick={logoutUser}
            className="flex w-full items-center gap-3 p-3 hover:bg-red-600 hover:text-white cursor-pointer rounded-md"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
}
