"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const EditBookPage = () => {
  const router = useRouter();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    published_date: "",
    image: null,
  });

  const [preview, setPreview] = useState("/default-book.png"); // Default placeholder

  useEffect(() => {
    // Fetch book details
    const fetchBook = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/books/${id}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (response.ok) {
          const book = await response.json();
          setFormData({
            title: book.title || "",
            author: book.author || "",
            published_date: book.published_date || "",
            image: null, // Image field remains null until changed
          });

          if (book.image) {
            setPreview(book.image);
          }
        } else {
          console.error("Failed to fetch book details");
        }
      } catch (error) {
        console.error("Error fetching book:", error);
      }
    };

    fetchBook();
  }, [id]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("author", formData.author);
    formDataToSend.append("published_date", formData.published_date);
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/books/${id}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        router.push("/"); // Redirect to book list after update
      } else {
        console.error("Failed to update book");
      }
    } catch (error) {
      console.error("Error updating book:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 shadow-md rounded-md">
      <h2 className="text-xl font-semibold mb-4">Edit Book</h2>

      {/* Book Image Preview */}
      <div className="flex flex-col items-center">
        <Image
          src={preview}
          alt="Book Cover"
          width={128}
          height={192}
          className="w-32 h-48 rounded border mb-3 object-cover"
          unoptimized
        />
        <label className="bg-blue-500 text-white px-4 py-1 rounded cursor-pointer">
          Change Cover
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
      </div>

      {/* Book Info Form */}
      <form className="flex flex-col mt-4" onSubmit={handleSubmit}>
        <label className="text-sm font-medium">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="border p-2 rounded mb-3"
          required
        />

        <label className="text-sm font-medium">
          Author <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          className="border p-2 rounded mb-3"
          required
        />

        <label className="text-sm font-medium">
          Published Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.published_date}
          onChange={(e) =>
            setFormData({ ...formData, published_date: e.target.value })
          }
          className="border p-2 rounded mb-3"
          required
        />

        <button
          type="submit"
          className="px-4 py-1 text-sm font-medium text-white rounded"
          style={{ backgroundColor: "var(--primary-color)" }}
        >
          Update Book
        </button>
      </form>
    </div>
  );
};

export default EditBookPage;
