import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import SearchBar from "@/components/SearchBar/SearchBar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const BookList = ({ books }) => {
  const [filteredBooks, setFilteredBooks] = useState(books);
  const { user } = useAuth();
  const [borrowedBooks, setBorrowedBooks] = useState(new Set());
  const [borrowedBooksByOthers, setBorrowedBooksByOthers] = useState(new Set());

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

      // Create a Set of borrowed book IDs by the current user
      const borrowedSet = new Set(
        response.data
          .filter((book) => book.borrowed_by === user?.email) // Books borrowed by the current user
          .map((book) => book.id)
      );

      // Create a Set of borrowed book IDs by other users
      const borrowedByOthersSet = new Set(
        response.data
          .filter(
            (book) => book.borrowed_by && book.borrowed_by !== user?.email
          ) // Books borrowed by others
          .map((book) => book.id)
      );

      setBorrowedBooks(borrowedSet);
      setBorrowedBooksByOthers(borrowedByOthersSet);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const handleBorrowReturn = async (bookId, action) => {
    const confirmMessage =
      action === "borrow"
        ? "Are you sure you want to borrow this book?"
        : "Are you sure you want to return this book?";

    if (!window.confirm(confirmMessage)) return;

    try {
      const accessToken = localStorage.getItem("access_token");
      await axios.post(
        `${API_BASE_URL}/api/books/${bookId}/${action}/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      fetchBorrowedBooks();
    } catch (error) {
      console.error(`Failed to ${action} book:`, error);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-[var(--text-black)] mb-6">
        Explore Our Collection
      </h2>

      {/* Search Bar */}
      <SearchBar books={books} onSearchResults={setFilteredBooks} />

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <p className="text-[var(--secondary-color)] text-lg text-center mt-4">
          No books found.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mt-6">
          {filteredBooks.map((book) => {
            const isBorrowed = borrowedBooks.has(book.id);
            const isBorrowedByOther = borrowedBooksByOthers.has(book.id);

            return (
              <div
                key={book.id}
                className="relative group flex flex-col items-center w-48 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-visible cursor-pointer"
              >
                <Link href={`/books/${book.id}`} passHref className="w-full">
                  {/* Tooltip Wrapper */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[var(--primary-color)] text-white text-sm p-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-60 z-50 pointer-events-none">
                    <h3 className="font-semibold">{book.title}</h3>
                    <p>by {book.author || "Unknown Author"}</p>
                    <p className="text-xs">
                      Published: {book.published_date || "N/A"}
                    </p>
                    {book.description && (
                      <p className="text-xs mt-1">{book.description}</p>
                    )}
                  </div>

                  {/* Book Image */}
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

                  {/* Book Details */}
                  <div className="w-full text-center px-3 py-3">
                    <h3 className="text-lg font-semibold text-[var(--card-title)]">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {book.author || "Unknown Author"}
                    </p>

                    {/* Show Borrowed Status (Only When Logged In) */}
                    {user && (
                      <p className="text-xs font-semibold mt-1 text-gray-600">
                        {isBorrowed
                          ? "📖 Borrowed"
                          : isBorrowedByOther
                          ? "📖 Borrowed by another user"
                          : "Available"}
                      </p>
                    )}
                  </div>
                </Link>

                {/* Borrow/Return Button (Only for Logged-In Users) */}
                {user && !isBorrowedByOther && (
                  <button
                    className={`mt-2 mb-3 px-4 py-2 text-white text-sm font-semibold rounded-md ${
                      isBorrowed
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    } transition`}
                    onClick={() =>
                      handleBorrowReturn(
                        book.id,
                        isBorrowed ? "return" : "borrow"
                      )
                    }
                  >
                    {isBorrowed ? "Return Book" : "Borrow Book"}
                  </button>
                )}

                {/* Display Message if Borrowed by Another User */}
                {isBorrowedByOther && (
                  <p className="mt-2 text-red-500 text-sm font-semibold">
                    This book is currently borrowed by another user.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookList;
