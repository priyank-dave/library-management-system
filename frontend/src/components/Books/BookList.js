"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const BooksList = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/books/");
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-[var(--card-title)] mb-8">
        Explore Our Collection
      </h2>

      {books.length === 0 ? (
        <p className="text-[var(--secondary-color)] text-lg text-center">
          No books available.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-center">
          {books.map((book) => (
            <div
              key={book.id}
              className="relative group cursor-pointer flex flex-col items-center w-48 bg-[var(--bg-light)] rounded-lg border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Tooltip on Hover (Top) */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[var(--primary-color)] text-white text-sm p-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-60 z-50">
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
              <div className="w-full h-72 flex justify-center items-center overflow-hidden rounded-t-lg bg-[var(--border-color)]">
                <Image
                  src={book.image || "/default-book.jpg"}
                  alt={book.title}
                  width={180}
                  height={260}
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Book Title & Author */}
              <div className="w-full text-center px-3 py-3">
                <h3 className="text-lg font-semibold text-[var(--card-title)]">
                  {book.title}
                </h3>
                <p className="text-sm text-[var(--secondary-color)]">
                  {book.author || "Unknown Author"}
                </p>
              </div>

              {/* View Book Button */}
              <button className="mt-2 mb-4 px-4 py-2 text-sm font-medium text-[var(--text-white)] bg-[var(--primary-color)] rounded-md hover:bg-opacity-90 transition">
                View Book
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BooksList;
