import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { logoutUser } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logoutUser(); // Logout user using the context
    toggleSidebar(); // Close sidebar after logging out
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out z-50 shadow-lg`}
    >
      {/* Close Button */}
      <button onClick={toggleSidebar} className="p-4 text-right text-white">
        ✕
      </button>

      {/* Sidebar Links */}
      <ul className="mt-4">
        <li
          onClick={() => {
            router.push("/user/profile"); // Navigate to the profile page
            toggleSidebar(); // Close sidebar after clicking
          }}
          className="p-4 hover:bg-gray-700 cursor-pointer"
        >
          Profile
        </li>

        <li
          onClick={handleLogout}
          className="p-4 hover:bg-gray-700 cursor-pointer"
        >
          Logout
        </li>
      </ul>
    </div>
  );
}
