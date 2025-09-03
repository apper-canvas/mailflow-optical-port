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

// Helper function to map database folder to UI format
const mapFolderFromDatabase = (folder) => {
  if (!folder) return null;
  
  return {
    Id: folder.Id,
    name: folder.name_c || folder.folder_name_c || "Unknown",
    icon: folder.icon_c || "Folder",
    type: folder.type_c || "custom",
    slug: folder.slug_c || folder.folder_slug_c || folder.name_c?.toLowerCase() || "unknown",
    count: 0 // Will be calculated separately
  };
};

// Fallback system folders in case database is empty
const fallbackSystemFolders = [
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
      const apperClient = getApperClient();
      
      // First, try to get folders from database
      const folderParams = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "folder_name_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "slug_c"}},
          {"field": {"Name": "folder_slug_c"}}
        ],
        orderBy: [{"fieldName": "Id", "sorttype": "ASC"}],
        pagingInfo: {"limit": 50, "offset": 0}
      };

      const folderResponse = await apperClient.fetchRecords("folder_c", folderParams);
      
      let folders = [];
      if (folderResponse.success && folderResponse.data && folderResponse.data.length > 0) {
        folders = folderResponse.data.map(mapFolderFromDatabase);
      } else {
        // Use fallback system folders if database is empty
        console.log("No folders found in database, using fallback system folders");
        folders = [...fallbackSystemFolders];
      }

      // Get all emails to calculate counts
      const emails = await emailService.getAll();
      
      // Calculate counts for each folder
      const foldersWithCounts = folders.map(folder => {
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
      return fallbackSystemFolders.map(folder => ({ ...folder, count: 0 }));
    }
  },

async getById(id) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "folder_name_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "slug_c"}},
          {"field": {"Name": "folder_slug_c"}}
        ]
      };

      const response = await apperClient.getRecordById("folder_c", parseInt(id), params);
      
      if (response.success && response.data) {
        return mapFolderFromDatabase(response.data);
      } else {
        // Fallback to system folders
        const folder = fallbackSystemFolders.find(folder => folder.Id === parseInt(id));
        if (!folder) {
          throw new Error("Folder not found");
        }
        return { ...folder };
      }
    } catch (error) {
      console.error(`Error fetching folder ${id}:`, error);
      // Try fallback system folders
      const folder = fallbackSystemFolders.find(folder => folder.Id === parseInt(id));
      if (folder) {
        return { ...folder };
      }
      throw new Error("Folder not found");
    }
  },

async getBySlug(slug) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "folder_name_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "slug_c"}},
          {"field": {"Name": "folder_slug_c"}}
        ],
        where: [
          {"FieldName": "slug_c", "Operator": "ExactMatch", "Values": [slug]}
        ],
        pagingInfo: {"limit": 1, "offset": 0}
      };

      const response = await apperClient.fetchRecords("folder_c", params);
      
      if (response.success && response.data && response.data.length > 0) {
        return mapFolderFromDatabase(response.data[0]);
      } else {
        // Fallback to system folders
        const folder = fallbackSystemFolders.find(folder => folder.slug === slug);
        if (!folder) {
          throw new Error("Folder not found");
        }
        return { ...folder };
      }
    } catch (error) {
      console.error(`Error fetching folder ${slug}:`, error);
      // Try fallback system folders
      const folder = fallbackSystemFolders.find(folder => folder.slug === slug);
      if (folder) {
        return { ...folder };
      }
      throw new Error("Folder not found");
    }
  }
};

export default folderService;