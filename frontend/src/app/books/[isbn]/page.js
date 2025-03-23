"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function BookDetailPage() {
  const { isbn } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowedBooks, setBorrowedBooks] = useState({});
  const [borrowedBooksByOthers, setBorrowedBooksByOthers] = useState({});

  useEffect(() => {
    if (isbn) {
      fetchBook();
    }
  }, [isbn]);

  useEffect(() => {
    if (user) {
      fetchBorrowedBooks();
    }
  }, [user]);

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

  const fetchBorrowedBooks = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE_URL}/api/books/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const userBorrowed = {};
      const othersBorrowed = {};

      response.data.forEach((book) => {
        if (book.borrowed_by_email === user?.email) {
          userBorrowed[book.isbn] = book.due_date || "Unknown";
        } else if (book.borrowed_by_email) {
          othersBorrowed[book.isbn] = book.borrowed_by_name || "Unknown User";
        }
      });

      setBorrowedBooks(userBorrowed);
      setBorrowedBooksByOthers(othersBorrowed);
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

  const formatDate = (dateString) => {
    if (!dateString || dateString === "Unknown") return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const isOverdue = (dueDate) => {
    if (!dueDate || dueDate === "Unknown") return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!book) {
    return <div className="text-center py-10 text-red-500">Book not found</div>;
  }

  const isBorrowed = borrowedBooks.hasOwnProperty(book.isbn);
  const borrowedByOther = borrowedBooksByOthers[book.isbn];
  const dueDate = borrowedBooks[book.isbn] || null;
  const overdue = isOverdue(dueDate);

  return (
    <div className="container mx-auto px-6 py-10 flex flex-col md:flex-row gap-6 md:gap-10 items-center">
      {/* Book Cover */}
      <div className="w-full md:w-1/2 flex justify-center">
        <Image
          src={book.image ? `${book.image}` : "/default-book.jpg"}
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

        {/* Category Badge */}
        {book.category_name && (
          <p className="mt-4">
            <span className="inline-block bg-[var(--primary-color)] text-white text-sm font-semibold px-3 py-1 rounded-full">
              📚 {book.category_name}
            </span>
          </p>
        )}

        {/* Description */}
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-gray-800">Description</h2>
          <p className="text-gray-600 mt-2">
            {book.description || "No description available."}
          </p>
        </div>

        {/* Status Message */}
        {user && (
          <p
            className={`text-sm font-semibold mt-4 min-h-[30px] ${
              isBorrowed
                ? overdue
                  ? "text-red-600"
                  : "text-gray-600"
                : "text-gray-500"
            }`}
          >
            {isBorrowed
              ? `📖 Borrowed (Due: ${formatDate(dueDate)})`
              : borrowedByOther
              ? `📖 Borrowed by ${borrowedByOther}`
              : "Available"}
          </p>
        )}

        {overdue && isBorrowed && (
          <p className="text-xs font-bold text-red-500">
            ⚠ Overdue! Return ASAP.
          </p>
        )}

        {/* View PDF Button (Only if Borrowed) */}
        {user && isBorrowed && book.pdf && (
          <div className="mt-4">
            <button
              onClick={() => window.open(book.pdf, "_blank")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              View PDF
            </button>
          </div>
        )}

        {/* Borrow/Return Buttons */}
        <div className="mt-6 space-x-4">
          {user && !borrowedByOther && (
            <button
              onClick={() =>
                handleBorrowReturn(book.isbn, isBorrowed ? "return" : "borrow")
              }
              className={`px-4 py-2 text-white text-sm font-semibold rounded-md ${
                isBorrowed
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              } transition`}
            >
              {isBorrowed ? "Return Book" : "Borrow Book"}
            </button>
          )}

          {borrowedByOther && (
            <p className="text-red-500 text-sm font-semibold mt-2">
              Borrowed by {borrowedByOther}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
