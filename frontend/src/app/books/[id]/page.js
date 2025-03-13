"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/books/${id}/`);
        setBook(response.data);
      } catch (error) {
        console.error("Failed to fetch book:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBook();
  }, [id]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!book) {
    return <div className="text-center py-10 text-red-500">Book not found</div>;
  }

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
          {" "}
          {/* Reduced margin for compact layout */}
          <h2 className="text-xl font-semibold text-gray-800">Description</h2>
          <p className="text-gray-600 mt-2">
            {book.description || "No description available."}
          </p>
        </div>
      </div>
    </div>
  );
}
