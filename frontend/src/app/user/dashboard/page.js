"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBorrowedBooks: 0,
    userBorrowedBooks: 0,
    availableBooks: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await axios.get(`${API_BASE_URL}/api/books/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const totalBorrowedBooks = response.data.results.filter(
          (book) => book.borrowed_by
        ).length; // Books borrowed by any user

        const userBorrowedBooks = response.data.results.filter(
          (book) => book.borrowed_by === user?.email
        ).length; // Books borrowed by logged-in user

        const availableBooks =
          response.data.results.length - totalBorrowedBooks; // Remaining available books

        setStats({ totalBorrowedBooks, userBorrowedBooks, availableBooks });
      } catch (error) {
        console.error("Error fetching book statistics:", error);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const { totalBorrowedBooks, userBorrowedBooks, availableBooks } = stats;

  // Colors for cards & pie chart
  const cardColors = {
    totalBorrowed: "bg-blue-200 text-blue-900",
    userBorrowed: "bg-red-200 text-red-900",
    available: "bg-green-200 text-green-900",
  };

  const pieData = {
    labels: ["Total Borrowed Books", "Books You Borrowed", "Available Books"],
    datasets: [
      {
        data: [totalBorrowedBooks, userBorrowedBooks, availableBooks],
        backgroundColor: ["#60A5FA", "#F87171", "#34D399"],
        hoverBackgroundColor: ["#3B82F6", "#EF4444", "#10B981"],
      },
    ],
  };

  return (
    <div className="max-w-screen-xl mx-auto py-12 px-4">
      {/* Welcome Message */}
      <h1 className="text-3xl font-bold text-[var(--text-black)] mb-6">
        Welcome, {user?.first_name} {user?.last_name}!
      </h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className={`p-6 rounded-lg shadow-md ${cardColors.totalBorrowed}`}>
          <h2 className="text-lg font-semibold">Total Borrowed Books</h2>
          <p className="text-4xl font-bold">{totalBorrowedBooks}</p>
        </div>
        <div className={`p-6 rounded-lg shadow-md ${cardColors.userBorrowed}`}>
          <h2 className="text-lg font-semibold">Books You Borrowed</h2>
          <p className="text-4xl font-bold">{userBorrowedBooks}</p>
        </div>
        <div className={`p-6 rounded-lg shadow-md ${cardColors.available}`}>
          <h2 className="text-lg font-semibold">Available Books</h2>
          <p className="text-4xl font-bold">{availableBooks}</p>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="flex justify-center">
        <div className="w-full md:w-1/2 lg:w-1/3">
          <Pie data={pieData} />
        </div>
      </div>
    </div>
  );
}
