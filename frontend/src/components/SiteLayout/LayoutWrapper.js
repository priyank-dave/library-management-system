"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/SiteLayout/Sidebar/Sidebar";
import Navbar from "@/components/SiteLayout/Navbar/Navbar";
import { useAuth } from "@/context/AuthContext";

export default function LayoutWrapper({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth(); // Get authenticated user

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Close sidebar when user logs out
  useEffect(() => {
    if (!user) {
      setIsSidebarOpen(false);
    }
  }, [user]);

  return (
    <div className="flex h-screen">
      {/* Show Sidebar only when user is logged in */}
      {user && <Sidebar isOpen={isSidebarOpen} />}

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          user && isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Navbar toggleSidebar={toggleSidebar} />
        <main>{children}</main>
      </div>
    </div>
  );
}
