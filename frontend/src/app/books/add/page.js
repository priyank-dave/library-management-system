"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const AddBookPage = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    isbn: "",
    title: "",
    author: "",
    published_date: "",
    category: "",
    image: null,
    pdf: null,
  });

  const [preview, setPreview] = useState("/default-book.png"); // Placeholder image

  useEffect(() => {
    const fetchCategories = async () => {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        console.error("No access token found.");
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/categories/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePdfChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData({ ...formData, pdf: file });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("isbn", formData.isbn);
    formDataToSend.append("title", formData.title);
    formDataToSend.append("author", formData.author);
    formDataToSend.append("published_date", formData.published_date);
    formDataToSend.append("category", formData.category); // Send as plain value

    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }
    if (formData.pdf) {
      formDataToSend.append("pdf", formData.pdf);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/books/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          // ❌ Do NOT set "Content-Type" when using FormData (let the browser handle it)
        },
        body: formDataToSend,
      });

      if (response.ok) {
        router.push("/"); // Redirect to book list after adding
      } else {
        const errorData = await response.json();
        console.error("Failed to add book:", errorData);
      }
    } catch (error) {
      console.error("Error adding book:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 shadow-md rounded-md">
      <h2 className="text-xl font-semibold mb-4">Add a New Book</h2>

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
          Upload Cover
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
          ISBN <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.isbn}
          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
          className="border p-2 rounded mb-3"
          required
        />

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

        {/* Category Select Dropdown */}
        <label className="text-sm font-medium">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="border p-2 rounded mb-3"
          required
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {/* PDF Upload Section */}
        <label className="text-sm font-medium">
          PDF <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept="application/pdf"
          className="border p-2 rounded mb-3"
          onChange={handlePdfChange}
          required
        />

        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white rounded"
          style={{ backgroundColor: "var(--primary-color)" }}
        >
          Add Book
        </button>
      </form>
    </div>
  );
};

export default AddBookPage;
