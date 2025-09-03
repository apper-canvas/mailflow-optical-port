import foldersData from "@/services/mockData/folders.json";
import emailService from "@/services/api/emailService";

let folders = [...foldersData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const folderService = {
  async getAll() {
    await delay(200);
    
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
  },

  async getById(id) {
    await delay(150);
    const folder = folders.find(folder => folder.Id === parseInt(id));
    if (!folder) {
      throw new Error("Folder not found");
    }
    return { ...folder };
  },

  async getBySlug(slug) {
    await delay(150);
    const folder = folders.find(folder => folder.slug === slug);
    if (!folder) {
      throw new Error("Folder not found");
    }
    return { ...folder };
  }
};

export default folderService;