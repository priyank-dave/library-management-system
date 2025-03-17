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
    <div className="flex">
      {/* Show Sidebar only when user is authenticated */}
      {user && <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}

      <div className="flex-1">
        <Navbar toggleSidebar={user ? toggleSidebar : null} />
        <main>{children}</main>
      </div>
    </div>
  );
}
