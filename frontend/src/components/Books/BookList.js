import { useEffect, useState } from "react";

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
    <div className="container mx-auto py-8 px-6">
      <h2 className="text-3xl font-bold text-[var(--ctp-mocha-blue)] mb-6">
        All Books
      </h2>
      {books.length === 0 ? (
        <p className="text-[var(--ctp-mocha-subtext)]">No books available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-[var(--ctp-mocha-surface1)] shadow-md rounded-lg p-4 transition-transform transform hover:scale-105"
            >
              <h3 className="text-xl font-semibold text-[var(--ctp-mocha-green)]">
                {book.title}
              </h3>
              <p className="text-[var(--ctp-mocha-subtext)]">
                by {book.author}
              </p>
              <p className="text-[var(--ctp-mocha-text)] text-sm">
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
