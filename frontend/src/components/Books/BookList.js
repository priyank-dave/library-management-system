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
  const [borrowedBooks, setBorrowedBooks] = useState({});
  const [borrowedBooksByOthers, setBorrowedBooksByOthers] = useState({});

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

      const userBorrowed = {};
      const othersBorrowed = {};

      response.data.results.forEach((book) => {
        if (book.borrowed_by === user?.email) {
          userBorrowed[book.isbn] = {
            due_date: book.due_date || "Unknown",
            fee: book.overdue_fee || 0, // Ensure overdue_fee is captured
          };
        } else if (book.is_borrowed && book.borrowed_by) {
          othersBorrowed[book.isbn] = book.borrowed_by || "Unknown User";
        }
      });

      setBorrowedBooks(userBorrowed);
      setBorrowedBooksByOthers(othersBorrowed);
    } catch (error) {
      console.error("Error fetching books:", error);
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

      if (action === "return" && borrowedBooks[isbn]?.fee > 0) {
        const payConfirm = window.confirm(
          `You have an overdue fee of $${borrowedBooks[isbn].fee}. Pay now?`
        );
        if (!payConfirm) return;

        await axios.post(
          `${API_BASE_URL}/api/pay-fee/`,
          {
            isbn,
            amount: borrowedBooks[isbn].fee, // Add amount in payload
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }

      await axios.post(
        `${API_BASE_URL}/api/books/${isbn}/${action}/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      fetchBorrowedBooks();

      if (window.refreshNotifications) {
        console.log("Notif");
        window.refreshNotifications();
      }
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

  return (
    <div className="max-w-screen-xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-[var(--text-black)] mb-6">
        Explore Our Collection
      </h2>

      <SearchBar books={books} onSearchResults={setFilteredBooks} />

      {filteredBooks.length === 0 ? (
        <p className="text-[var(--secondary-color)] text-lg text-center mt-4">
          No books found.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mt-6">
          {filteredBooks.map((book) => {
            const isBorrowed = borrowedBooks.hasOwnProperty(book.isbn);
            const borrowedByOther = borrowedBooksByOthers[book.isbn];
            const dueDate = borrowedBooks[book.isbn]?.due_date || null;
            const overdue = isOverdue(dueDate);
            const fee = borrowedBooks[book.isbn]?.fee || 0;

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
                      Published: {book.published_date || "N/A"}
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

                  <div className="w-full text-center px-3 py-3 flex flex-col">
                    <h3 className="text-lg font-semibold text-[var(--card-title)]">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {book.author || "Unknown Author"}
                    </p>

                    {book.category_name && (
                      <p className="mt-1">
                        <span className="inline-block bg-[var(--primary-color)] text-white text-xs font-semibold px-3 py-1 rounded-full">
                          {book.category_name}
                        </span>
                      </p>
                    )}

                    {user && (
                      <>
                        <p
                          className={`text-xs font-semibold mt-1 min-h-[30px] flex items-center justify-center ${
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
                            ? `📖 Borrowed by another user`
                            : "Available"}
                        </p>

                        {overdue && isBorrowed && (
                          <p className="text-xs font-bold text-red-500">
                            ⚠ Overdue! Return ASAP.
                          </p>
                        )}
                      </>
                    )}

                    <div className="mt-auto">
                      {user && !borrowedByOther && (
                        <button
                          className={`mt-1 mb-3 px-4 py-2 text-white text-sm font-semibold rounded-md ${
                            isBorrowed
                              ? fee > 0
                                ? "bg-orange-500 hover:bg-orange-600"
                                : "bg-red-500 hover:bg-red-600"
                              : "bg-green-500 hover:bg-green-600"
                          } transition`}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleBorrowReturn(
                              book.isbn,
                              isBorrowed ? "return" : "borrow"
                            );
                          }}
                          disabled={borrowedByOther}
                        >
                          {isBorrowed
                            ? fee > 0
                              ? "Pay & Return"
                              : "Return Book"
                            : "Borrow Book"}
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookList;
