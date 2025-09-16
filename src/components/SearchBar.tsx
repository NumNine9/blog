import { useState, useEffect } from "react";
import { BlogPost } from "@/lib/supabase";
import { Article } from "@/lib/supabase";

interface SearchBarProps {
  onSearch: (query: string, filter: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "Search content...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const handleSearch = () => {
    onSearch(query, filter);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
      <div className="flex-1 flex flex-col">
        <label
          htmlFor="search"
          className="text-sm font-medium text-gray-700 mb-1"
        >
          Search Content
        </label>
        <input
          id="search"
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="filter"
          className="text-sm font-medium text-gray-700 mb-1"
        >
          Content Type
        </label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Content</option>
          <option value="internal">Our Writers</option>
          <option value="external">News Sources</option>
        </select>
      </div>

      <div className="flex items-end">
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>
    </div>
  );
}
