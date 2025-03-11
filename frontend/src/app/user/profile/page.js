"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

const HOST = "http://127.0.0.1:8000";

const ProfilePage = () => {
  const { user, fetchUser } = useAuth();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    profile_picture: "/default-profile.png",
  });

  const [newProfilePic, setNewProfilePic] = useState(null);
  const [preview, setPreview] = useState("/default-profile.png");

  // Update form data when user is fetched
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        profile_picture: user.profile_picture || "/default-profile.png",
      });

      setPreview(user.profile_picture || "/default-profile.png");
    }
  }, [user]);

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDeletePhoto = async () => {
    try {
      const formData = new FormData();
      formData.append("profile_picture", ""); // Send empty string instead of null

      const response = await fetch(`${HOST}/api/user/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        setPreview("/default-profile.png");
        fetchUser(); // Refresh user data
      } else {
        console.error("Failed to delete profile picture");
      }
    } catch (error) {
      console.error("Error deleting profile picture:", error);
    }
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("first_name", formData.first_name);
    formDataToSend.append("last_name", formData.last_name);
    formDataToSend.append("email", formData.email);
    if (newProfilePic) {
      formDataToSend.append("profile_picture", newProfilePic);
    }

    try {
      const response = await fetch(`${HOST}/api/user/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        fetchUser();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (!user) {
    return <p className="text-center mt-6">Loading user data...</p>;
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 shadow-md rounded-md">
      <h2 className="text-xl font-semibold mb-4">User Information</h2>

      {/* Profile Picture Section */}
      <div className="flex flex-col items-center">
        <Image
          src={preview}
          alt="Profile"
          width={128}
          height={128}
          className="w-32 h-32 rounded-full border mb-3 object-cover"
          unoptimized
        />

        <div className="flex gap-2">
          <label className="bg-blue-500 text-white px-4 py-1 rounded cursor-pointer">
            Edit Photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePictureChange}
            />
          </label>
          <button
            className="bg-red-500 text-white px-4 py-1 rounded"
            onClick={handleDeletePhoto}
          >
            Delete Photo
          </button>
        </div>
      </div>

      {/* User Info Form */}
      <form className="flex flex-col mt-4" onSubmit={handleUpdateProfile}>
        <label className="text-sm font-medium">
          First Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.first_name}
          onChange={(e) =>
            setFormData({ ...formData, first_name: e.target.value })
          }
          className="border p-2 rounded mb-3"
          required
        />

        <label className="text-sm font-medium">
          Last Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.last_name}
          onChange={(e) =>
            setFormData({ ...formData, last_name: e.target.value })
          }
          className="border p-2 rounded mb-3"
          required
        />

        <label className="text-sm font-medium">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border p-2 rounded mb-3"
          required
        />

        <button
          type="submit"
          className="px-4 py-1 text-sm font-medium text-white rounded"
          style={{ backgroundColor: "var(--primary-color)" }}
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
