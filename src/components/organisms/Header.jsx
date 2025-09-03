import React from "react";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import LogoutButton from "@/components/molecules/LogoutButton";
const Header = ({ onMenuClick, onSearch, title = "Inbox" }) => {
  return (
<header className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 flex-shrink-0">
      <div className="flex items-center gap-4">
<button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
        >
          <ApperIcon name="Menu" size={20} />
        </button>
        
<div className="flex-1 max-w-2xl mx-2 sm:mx-4">
          <SearchBar onSearch={onSearch} />
        </div>

<div className="flex items-center gap-3">
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200">
            <ApperIcon name="Settings" size={20} />
</button>
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200">
            <ApperIcon name="Bell" size={20} />
          </button>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
};

export default Header;