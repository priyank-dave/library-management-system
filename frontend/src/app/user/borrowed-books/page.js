"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import SearchBar from "@/components/SearchBar/SearchBar";
import Image from "next/image";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const BorrowedBooks = () => {
  const { user } = useAuth();
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);

  useEffect(() => {
    if (user) {
      fetchBorrowedBooks();
    }
  }, [user]);

  const fetchBorrowedBooks = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE_URL}/api/books/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const userBorrowedBooks = response.data.filter(
        (book) => book.borrowed_by === user?.email
      );
      setBorrowedBooks(userBorrowedBooks);
      setFilteredBooks(userBorrowedBooks);
    } catch (error) {
      console.error("Error fetching borrowed books:", error);
    }
  };

  const handleBorrowReturn = async (isbn) => {
    if (!window.confirm("Are you sure you want to return this book?")) return;

    try {
      const accessToken = localStorage.getItem("access_token");
      await axios.post(
        `${API_BASE_URL}/api/books/${isbn}/return/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      fetchBorrowedBooks();
    } catch (error) {
      console.error("Failed to return book:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // "DD-MM-YYYY" format
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    return due < today; // Check if due date is before today
  };

  return (
    <div className="max-w-screen-xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-[var(--text-black)] mb-6">
        Your Borrowed Books
      </h2>

      <SearchBar books={borrowedBooks} onSearchResults={setFilteredBooks} />

      {filteredBooks.length === 0 ? (
        <p className="text-[var(--secondary-color)] text-lg text-center mt-4">
          You have not borrowed any books.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mt-6">
          {filteredBooks.map((book) => {
            const overdue = isOverdue(book.due_date);

            return (
              <div
                key={book.isbn}
                className="relative group flex flex-col items-center w-48 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-visible cursor-pointer"
              >
                <Link href={`/books/${book.isbn}`} passHref className="w-full">
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[var(--primary-color)] text-white text-sm p-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-60 z-50 pointer-events-none">
                    <h3 className="font-semibold">{book.title}</h3>
                    <p>by {book.author || "Unknown Author"}</p>
                    <p className="text-xs">
                      Published:{" "}
                      {book.published_date
                        ? formatDate(book.published_date)
                        : "N/A"}
                    </p>
                    {book.description && (
                      <p className="text-xs mt-1">{book.description}</p>
                    )}
                  </div>

                  <div className="relative w-full h-72 flex justify-center items-center overflow-hidden rounded-t-lg bg-gray-100">
                    <Image
                      src={book.image || "/default-book.jpg"}
                      alt={book.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-lg"
                      unoptimized
                    />
                  </div>

                  <div className="w-full text-center px-3 py-3">
                    <h3 className="text-lg font-semibold text-[var(--card-title)]">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {book.author || "Unknown Author"}
                    </p>

                    {/* Due Date Section */}
                    <p
                      className={`text-xs font-semibold mt-2 ${
                        overdue ? "text-red-600" : "text-gray-600"
                      }`}
                    >
                      📅 Due Date:{" "}
                      {book.due_date ? formatDate(book.due_date) : "N/A"}
                    </p>

                    {overdue && (
                      <p className="text-xs font-bold text-red-500">
                        ⚠ Overdue! Return ASAP.
                      </p>
                    )}
                  </div>
                </Link>

                <button
                  className="mt-2 mb-3 px-4 py-2 text-white text-sm font-semibold rounded-md bg-red-500 hover:bg-red-600 transition"
                  onClick={() => handleBorrowReturn(book.isbn)}
                >
                  Return Book
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BorrowedBooks;
