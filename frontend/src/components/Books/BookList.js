import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/SearchBar/SearchBar";

const BookList = ({ books }) => {
  const [filteredBooks, setFilteredBooks] = useState(books);

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
          {filteredBooks.map((book) => (
            <Link key={book.id} href={`/books/${book.id}`} passHref>
              <div className="relative group flex flex-col items-center w-48 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-visible cursor-pointer">
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
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookList;
