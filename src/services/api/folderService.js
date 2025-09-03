import emailService from "@/services/api/emailService";
import { toast } from "react-toastify";

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// System folders - these are hardcoded as they represent the email application structure
const systemFolders = [
  {
    Id: 1,
    name: "Inbox",
    icon: "Inbox",
    type: "system",
    slug: "inbox"
  },
  {
    Id: 2,
    name: "Sent",
    icon: "Send",
    type: "system",
    slug: "sent"
  },
  {
    Id: 3,
    name: "Drafts",
    icon: "FileText",
    type: "system",
    slug: "drafts"
  },
  {
    Id: 4,
    name: "Starred",
    icon: "Star",
    type: "system",
    slug: "starred"
  },
  {
    Id: 5,
    name: "Trash",
    icon: "Trash2",
    type: "system",
    slug: "trash"
  }
];

const folderService = {
  async getAll() {
    try {
      // Get all emails to calculate counts
      const emails = await emailService.getAll();
      
      // Calculate counts for each folder
      const foldersWithCounts = systemFolders.map(folder => {
        let count = 0;
        
        if (folder.slug === "starred") {
          // Count starred emails across all folders except trash
          count = emails.filter(email => email.isStarred && email.folder !== "trash").length;
        } else if (folder.slug === "inbox") {
          // Count unread emails in inbox
          count = emails.filter(email => email.folder === "inbox" && !email.isRead).length;
        } else {
          // Count all emails in the specific folder
          count = emails.filter(email => email.folder === folder.slug).length;
        }
        
        return {
          ...folder,
          count
        };
      });
      
      return foldersWithCounts;
    } catch (error) {
      console.error("Error fetching folders:", error);
      return systemFolders.map(folder => ({ ...folder, count: 0 }));
    }
  },

  async getById(id) {
    try {
      const folder = systemFolders.find(folder => folder.Id === parseInt(id));
      if (!folder) {
        throw new Error("Folder not found");
      }
      return { ...folder };
    } catch (error) {
      console.error(`Error fetching folder ${id}:`, error);
      throw new Error("Folder not found");
    }
  },

  async getBySlug(slug) {
    try {
      const folder = systemFolders.find(folder => folder.slug === slug);
      if (!folder) {
        throw new Error("Folder not found");
      }
      return { ...folder };
    } catch (error) {
      console.error(`Error fetching folder ${slug}:`, error);
      throw new Error("Folder not found");
    }
  }
};

export default folderService;