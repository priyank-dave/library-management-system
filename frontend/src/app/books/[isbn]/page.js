"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function BookDetailPage() {
  const { isbn } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [borrowedBooks, setBorrowedBooks] = useState(new Set());
  const [borrowedBooksByOthers, setBorrowedBooksByOthers] = useState(new Set());

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/books/${isbn}/`);
        setBook(response.data);
      } catch (error) {
        console.error("Failed to fetch book:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isbn) fetchBook();
  }, [isbn]);

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

      // Create a Set of borrowed book ISBNs by the current user
      const borrowedSet = new Set(
        response.data
          .filter((book) => book.borrowed_by === user?.email)
          .map((book) => book.isbn)
      );

      // Create a Set of borrowed book ISBNs by other users
      const borrowedByOthersSet = new Set(
        response.data
          .filter(
            (book) => book.borrowed_by && book.borrowed_by !== user?.email
          )
          .map((book) => book.isbn)
      );

      setBorrowedBooks(borrowedSet);
      setBorrowedBooksByOthers(borrowedByOthersSet);
    } catch (error) {
      console.error("Error fetching borrowed books:", error);
    }
  };

  const handleBorrowReturn = async (isbn, action) => {
    const confirmMessage =
      action === "borrow"
        ? "Are you sure you want to borrow this book?"
        : "Are you sure you want to return this book?";

    if (!window.confirm(confirmMessage)) return;

    try {
      const accessToken = localStorage.getItem("access_token");
      await axios.post(
        `${API_BASE_URL}/api/books/${isbn}/${action}/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      fetchBorrowedBooks();
    } catch (error) {
      console.error(`Failed to ${action} book:`, error);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!book) {
    return <div className="text-center py-10 text-red-500">Book not found</div>;
  }

  const isBorrowed = borrowedBooks.has(book.isbn);
  const isBorrowedByOther = borrowedBooksByOthers.has(book.isbn);

  return (
    <div className="container mx-auto px-6 py-10 flex flex-col md:flex-row gap-6 md:gap-2 items-center">
      {/* Book Cover */}
      <div className="w-full md:w-1/2 flex justify-center">
        <Image
          src={book.image ? `${book.image}` : "/default-cover.jpg"}
          alt={book.title}
          width={300}
          height={450}
          className="rounded-lg shadow-lg object-cover"
          unoptimized
        />
      </div>

      {/* Book Information */}
      <div className="w-full md:w-1/2">
        <h1 className="text-3xl font-bold text-gray-800">{book.title}</h1>
        <p className="text-lg text-gray-600 mt-2">by {book.author}</p>
        <p className="text-gray-500 mt-2">Published: {book.published_date}</p>

        <div className="mt-4">
          <h2 className="text-xl font-semibold text-gray-800">Description</h2>
          <p className="text-gray-600 mt-2">
            {book.description || "No description available."}
          </p>
        </div>

        {/* View PDF Button (Only if Borrowed) */}
        {user && isBorrowed && book.pdf && (
          <div className="mt-4 space-x-4">
            <button
              onClick={() => window.open(book.pdf, "_blank")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              View PDF
            </button>
          </div>
        )}

        {/* Borrow/Return Button */}
        {user && !isBorrowed && !isBorrowedByOther && (
          <button
            onClick={() => handleBorrowReturn(book.isbn, "borrow")}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
          >
            Borrow Book
          </button>
        )}

        {/* Return Book Button */}
        {user && isBorrowed && (
          <button
            onClick={() => handleBorrowReturn(book.isbn, "return")}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
          >
            Return Book
          </button>
        )}

        {/* Message if Borrowed by Another User */}
        {isBorrowedByOther && (
          <p className="mt-4 text-red-500 text-sm font-semibold">
            This book is currently borrowed by another user.
          </p>
        )}
      </div>
    </div>
  );
}
