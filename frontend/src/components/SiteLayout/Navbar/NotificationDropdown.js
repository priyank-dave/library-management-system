import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle, Circle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, fetchUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    window.refreshNotifications = fetchNotifications; // 🔥 Make it globally accessible
  }, []);

  // Function to fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(data.results.slice(0, 3)); // Show top 3 notifications
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [user]);

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

  // Mark notification as read
  const markAsRead = async (id) => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );

      fetchUser(); // Refresh user to update notification count
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative p-2 text-gray-700 transition-all duration-300 ease-in-out hover:bg-gray-200 hover:shadow-lg rounded-full"
      >
        <Bell className="w-6 h-6 text-icon-color hover:text-primary-color transition duration-300" />
        {notifications.some((notif) => !notif.is_read) && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border border-white rounded-full"></span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          <div className="p-2 font-semibold border-b">Notifications</div>
          <div className="max-h-48 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-2 p-3 text-sm cursor-pointer transition rounded-md ${
                    notif.is_read ? "bg-gray-100" : "bg-white"
                  } hover:bg-gray-200`}
                  onClick={() => {
                    markAsRead(notif.id);
                    router.push(notif.link || "/");
                  }}
                >
                  {notif.is_read ? (
                    <CheckCircle className="text-green-500 w-5 h-5" />
                  ) : (
                    <Circle className="text-blue-500 w-5 h-5" />
                  )}
                  <div>
                    <p className="font-medium">{notif.title}</p>
                    <p className="text-gray-500 text-xs">{notif.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-3 text-gray-500 text-center">
                No new notifications
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
