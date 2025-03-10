import { useState, useEffect, useCallback } from "react";
import Fuse from "fuse.js";

const SearchBar = ({ books, onSearchResults }) => {
  const [query, setQuery] = useState("");

  const handleSearch = useCallback(
    (searchTerm) => {
      setQuery(searchTerm);

      if (!searchTerm) {
        onSearchResults(books);
        return;
      }

      const fuse = new Fuse(books, {
        keys: ["title", "author"],
        ignoreLocation: true, // Matches anywhere in the string
        findAllMatches: true,
      });

      const results = fuse.search(searchTerm).map((result) => result.item);
      onSearchResults(results);
    },
    [books, onSearchResults]
  );

  // Debounce user input
  useEffect(() => {
    const delay = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(delay);
  }, [query, handleSearch]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search books..."
        className="w-full px-4 py-2 border border-[var(--border-color)] rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none"
      />
    </div>
  );
};

export default SearchBar;
