import foldersData from "@/services/mockData/folders.json";
import emailService from "./emailService.js";

let folders = [...foldersData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const folderService = {
  async getAll() {
    await delay(200);
    // Update counts based on current emails
    const allEmails = await emailService.getAll();
    
    const updatedFolders = folders.map(folder => {
      let count = 0;
      
      switch (folder.slug) {
        case "inbox":
          count = allEmails.filter(email => email.folder === "inbox").length;
          break;
        case "sent":
          count = allEmails.filter(email => email.folder === "sent").length;
          break;
        case "drafts":
          count = allEmails.filter(email => email.folder === "drafts").length;
          break;
        case "starred":
          count = allEmails.filter(email => email.isStarred).length;
          break;
        case "trash":
          count = allEmails.filter(email => email.folder === "trash").length;
          break;
        default:
          count = allEmails.filter(email => email.folder === folder.slug).length;
      }
      
      return { ...folder, count };
    });

    return updatedFolders;
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