import React, { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Input from "@/components/atoms/Input";
import { cn } from "@/utils/cn";

const SearchBar = ({ onSearch, placeholder = "Search emails...", className }) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative">
        <ApperIcon 
          name="Search" 
          size={16} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
        />
<Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-10 transition-all duration-200 text-sm sm:text-base bg-white",
            "h-9 sm:h-10",
            isFocused && "ring-2 ring-primary/20 border-primary"
          )}
        />
        {query && (
          <button
            type="button"
onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <ApperIcon name="X" size={16} />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;