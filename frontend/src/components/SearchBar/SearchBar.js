import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const searchFields = [
  { key: "title", label: "Title" },
  { key: "author", label: "Author" },
  { key: "category", label: "Category" },
];

const SearchBar = ({ onSearchResults }) => {
  const [selectedFields, setSelectedFields] = useState([]);
  const [query, setQuery] = useState({});

  // Toggle field selection
  const toggleField = (fieldKey) => {
    setSelectedFields((prev) =>
      prev.includes(fieldKey)
        ? prev.filter((f) => f !== fieldKey)
        : [...prev, fieldKey]
    );

    setQuery((prev) => ({
      ...prev,
      [fieldKey]: prev[fieldKey] || "", // Retain existing value if field is reselected
    }));
  };

  // Handle text input updates
  const handleInputChange = (e) => {
    const inputText = e.target.value;
    const newQuery = {};
    let remainingText = inputText;

    selectedFields.forEach((field) => {
      const prefix = `${field}: `;
      const regex = new RegExp(`${prefix}([^ ]*)`); // Extract input after field prefix
      const match = remainingText.match(regex);

      if (match) {
        newQuery[field] = match[1]; // Extract search term
        remainingText = remainingText.replace(match[0], "").trim(); // Remove matched part
      }
    });

    setQuery(newQuery);
  };

  // Generate display value for input
  const getSearchInputValue = () => {
    return selectedFields
      .map((field) => `${field}: ${query[field] || ""}`)
      .join(" ");
  };

  // Perform API search
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        let url = `${API_BASE_URL}/api/books/`;

        if (selectedFields.length > 0) {
          const queryParams = {};
          selectedFields.forEach((field) => {
            if (query[field]) {
              queryParams[field] = query[field];
            }
          });

          const queryString = new URLSearchParams(queryParams).toString();
          if (queryString) url += `?${queryString}`;
        }

        const response = await axios.get(url);
        onSearchResults(response.data.results);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    // Always fetch books, even when no filters are selected
    const delay = setTimeout(fetchBooks, 300);
    return () => clearTimeout(delay);
  }, [query, selectedFields, onSearchResults]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Search Field Selectors */}
      <div className="flex flex-wrap gap-2 mb-2">
        {searchFields.map(({ key, label }) => (
          <button
            key={key}
            className={`flex items-center space-x-2 px-3 py-1 border rounded-full ${
              selectedFields.includes(key) ? "bg-gray-300" : "bg-white"
            }`}
            onClick={() => toggleField(key)}
          >
            <span>🔍 {label}</span>
            {selectedFields.includes(key) && <span className="ml-1">✖</span>}
          </button>
        ))}
      </div>

      {/* Single Search Input */}
      <input
        type="text"
        value={getSearchInputValue()}
        onChange={handleInputChange}
        placeholder="Select fields and type to search..."
        disabled={selectedFields.length === 0}
        className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:outline-none ${
          selectedFields.length === 0
            ? "bg-gray-100 cursor-not-allowed"
            : "focus:ring-blue-500"
        }`}
      />
    </div>
  );
};

export default SearchBar;
