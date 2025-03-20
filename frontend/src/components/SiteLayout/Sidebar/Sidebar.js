"use client";

import { LayoutDashboard, BookOpen, Layers, LogOut } from "lucide-react";

export default function Sidebar({ isOpen }) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-[var(--bg-light)] border-r border-[var(--border-color)] shadow-lg transition-all duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-64"
      }`}
    >
      <ul className="text-[var(--text-black)] p-6 space-y-2">
        <li className="flex items-center gap-3 p-3 hover:bg-[var(--primary-color)] hover:text-white cursor-pointer rounded-md">
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </li>
        <li className="flex items-center gap-3 p-3 hover:bg-[var(--primary-color)] hover:text-white cursor-pointer rounded-md">
          <BookOpen className="w-5 h-5" />
          Borrowed Books
        </li>
        <li className="flex items-center gap-3 p-3 hover:bg-[var(--primary-color)] hover:text-white cursor-pointer rounded-md">
          <Layers className="w-5 h-5" />
          Manage Books
        </li>
        <li className="flex items-center gap-3 p-3 hover:bg-red-600 hover:text-white cursor-pointer rounded-md">
          <LogOut className="w-5 h-5" />
          Logout
        </li>
      </ul>
    </div>
  );
}
