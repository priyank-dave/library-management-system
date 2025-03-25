"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Sidebar from "@/components/SiteLayout/Sidebar/Sidebar"; // Import Sidebar
import NotificationDropdown from "./NotificationDropdown";

const Navbar = ({ toggleSidebar }) => {
  const router = useRouter();
  const { user, logoutUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setDropdownOpen(false);
  };

  return (
    <>
      <nav className="bg-[var(--bg-light)] border-b border-[var(--border-color)] shadow-md ">
        <div className="container mx-auto flex justify-between items-center px-6 py-3">
          {/* Left: Sidebar Toggle + Logo */}
          <div className="flex items-center gap-4">
            {user && (
              <button onClick={toggleSidebar} className="p-2 text-gray-700">
                <Menu className="w-6 h-6" />
              </button>
            )}
            <Link
              href="/"
              className="text-xl font-bold text-[var(--primary-color)] flex items-center gap-2 border-[1px] border-[var(--primary-color)] px-3 py-1 rounded-lg"
            >
              Aspire LMS
            </Link>
          </div>

          {/* Right: Auth & Profile Section */}
          <div className="flex items-center gap-4 text-black">
            {user && <NotificationDropdown />} {/* Add Notification Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 border border-[var(--primary-color)] px-3 py-2 rounded-lg hover:bg-[var(--primary-color)] hover:text-white transition"
                >
                  <Image
                    src={user.profile_picture}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                    unoptimized
                  />
                  <span>{user.first_name}</span>
                  <ChevronDown className="w-5 h-5" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        router.push("/user/profile");
                        setDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)] hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)] hover:text-white transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar Below Navbar */}
      <Sidebar isOpen={sidebarOpen} />
    </>
  );
};

export default Navbar;
