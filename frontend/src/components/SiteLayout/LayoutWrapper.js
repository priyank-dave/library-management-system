"use client";

import { useState } from "react";
import Sidebar from "@/components/SiteLayout/Sidebar/Sidebar";
import Navbar from "@/components/SiteLayout/Navbar/Navbar";
import { useAuth } from "@/context/AuthContext";

export default function LayoutWrapper({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth(); // Get authenticated user

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar should always be in layout */}
      {user && <Sidebar isOpen={isSidebarOpen} />}

      {/* Main Content Wrapper */}

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
