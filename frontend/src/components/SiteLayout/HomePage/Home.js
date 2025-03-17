import { useState, useEffect } from "react";
import Navbar from "@/components/SiteLayout/Navbar/Navbar";
import Sidebar from "@/components/SiteLayout/Sidebar/Sidebar";
import BookList from "@/components/Books/BookList";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function HomePage() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/books/`);
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div>
      <BookList books={books} />
    </div>
  );
}
