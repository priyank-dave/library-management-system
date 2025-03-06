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
    <div className="max-w-screen-xl mx-auto py-12 px-3">
      <h2 className="text-4xl font-bold text-[var(--ctp-blue)] mb-8 text-center">
        All Books
      </h2>

      {books.length === 0 ? (
        <p className="text-[var(--ctp-subtext)] text-lg text-center">
          No books available.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-[var(--ctp-surface1)] shadow-lg rounded-xl p-2 transition-transform transform hover:scale-105 hover:shadow-xl flex flex-col items-center"
            >
              {/* Book Image */}
              {book.image && (
                <div className="relative w-[180px] h-[220px] mb-2">
                  <Image
                    src={book.image}
                    alt={book.title}
                    layout="fill"
                    objectFit="contain"
                    className="rounded-md"
                    unoptimized
                  />
                </div>
              )}

              {/* Book Details */}
              <h3 className="text-xl font-semibold text-[var(--ctp-green)] mb-1 text-center">
                {book.title}
              </h3>
              <p className="text-[var(--ctp-subtext)] text-base mb-1 text-center">
                by {book.author}
              </p>
              <p className="text-[var(--ctp-text)] text-sm text-center">
                Published: {book.published_date}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BooksList;
