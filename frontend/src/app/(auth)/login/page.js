"use client";

import Link from "next/link";
import Image from "next/image";

const RoleSelection = () => {
  return (
    <div
      className="flex h-screen items-center justify-center bg-gray-100 "
      style={{ height: "calc(100vh - 68px)" }}
    >
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-3xl w-full flex flex-col md:flex-row items-center gap-8">
        {/* Librarian Section */}
        <div className="flex flex-col items-center p-6 w-full md:w-1/2 border border-gray-300 rounded-lg bg-gray-50 hover:shadow-md transition">
          <Image
            src="/librarian-icon.jpg"
            alt="Librarian Icon"
            width={100}
            height={100}
          />
          <h2 className="text-xl font-semibold mt-4">Librarian Login</h2>
          <p className="text-gray-600 text-center mt-2">
            Manage books, users, and the library system.
          </p>
          <Link href="/admin/login">
            <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Login as Librarian
            </button>
          </Link>
        </div>

        {/* User Section */}
        <div className="flex flex-col items-center p-6 w-full md:w-1/2 border border-gray-300 rounded-lg bg-gray-50 hover:shadow-md transition">
          <Image
            src="/user-icon.png"
            alt="User Icon"
            width={100}
            height={100}
          />
          <h2 className="text-xl font-semibold mt-4">User Login</h2>
          <p className="text-gray-600 text-center mt-2">
            Borrow books and explore library resources.
          </p>
          <Link href="/user/login">
            <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
              Login as User
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
