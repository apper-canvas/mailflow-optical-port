import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";
import folderService from "@/services/api/folderService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Sidebar = forwardRef(({ isOpen, onClose }, ref) => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useImperativeHandle(ref, () => ({
    loadFolders
  }));

  useEffect(() => {
    loadFolders();
  }, []);
  const loadFolders = async () => {
    try {
      setLoading(true);
      const data = await folderService.getAll();
      setFolders(data);
    } catch (error) {
      console.error("Error loading folders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompose = () => {
    navigate("/compose");
    onClose?.();
  };

  const sidebarContent = (
<div className="flex flex-col h-full bg-white overflow-hidden border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
<h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ApperIcon name="Mail" className="text-primary" />
            MailFlow
          </h1>
<button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>
        <Button
          onClick={handleCompose}
          className="w-full"
          icon="PenSquare"
        >
          Compose
        </Button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <li key={i} className="animate-pulse">
<div className="h-10 bg-gray-100 rounded-lg"></div>
              </li>
            ))
          ) : (
            folders.map((folder) => (
              <li key={folder.Id}>
                <NavLink
                  to={`/folder/${folder.slug}`}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "sidebar-item",
                      isActive && "active"
                    )
                  }
                >
                  <ApperIcon name={folder.icon} size={16} />
                  <span className="flex-1">{folder.name}</span>
<span className={cn(
                    "px-2 py-0.5 text-xs rounded-full font-medium",
                    folder.slug === "inbox" && folder.count > 0
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700"
                  )}>
                    {folder.count || 0}
                  </span>
                </NavLink>
              </li>
            ))
          )}
        </ul>
      </nav>
    </div>
  );

  // Desktop sidebar - static
  const desktopSidebar = (
<div className="hidden lg:flex w-64 border-r border-gray-200 bg-white flex-shrink-0">
      {sidebarContent}
    </div>
  );

  // Mobile sidebar - overlay
  const mobileSidebar = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
className="lg:hidden fixed left-0 top-0 bottom-0 w-64 sm:w-72 z-50"
          >
            {sidebarContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  );
});

export default Sidebar;