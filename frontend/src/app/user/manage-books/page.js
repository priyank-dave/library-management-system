"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import SearchBar from "@/components/SearchBar/SearchBar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/books/`);
        const data = await response.json();
        setBooks(data.results);
        setFilteredBooks(data.results);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  const handleDelete = async (isbn) => {
    const confirmMessage =
      "Are you sure you want to delete this book? This action cannot be undone.";

    if (!window.confirm(confirmMessage)) return;

    try {
      const accessToken = localStorage.getItem("access_token");
      await axios.delete(`${API_BASE_URL}/api/books/${isbn}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setBooks(books.filter((book) => book.isbn !== isbn));
      setFilteredBooks(filteredBooks.filter((book) => book.isbn !== isbn));
    } catch (error) {
      console.error("Failed to delete book:", error);
    }
  };

  const handleEdit = (isbn) => {
    window.location.href = `/books/edit/${isbn}`;
  };

  return (
    <div className="max-w-screen-xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-[var(--text-black)] mb-6">
        Manage Books
      </h2>

      <div className="mb-6">
        <Link href="/books/add">
          <button className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg font-semibold transition duration-300">
            Add New Book
          </button>
        </Link>
      </div>

      <SearchBar books={books} onSearchResults={setFilteredBooks} />

      {filteredBooks.length === 0 ? (
        <p className="text-[var(--secondary-color)] text-lg text-center mt-4">
          No books found.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mt-6">
          {filteredBooks.map((book) => (
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

                <div className="w-full text-center px-3 py-3">
                  <h3 className="text-lg font-semibold text-[var(--card-title)]">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {book.author || "Unknown Author"}
                  </p>
                </div>
              </Link>

              {user && (
                <div className="flex justify-around w-full mt-3">
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition duration-300"
                    onClick={() => handleEdit(book.isbn)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition duration-300"
                    onClick={() => handleDelete(book.isbn)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageBooks;
