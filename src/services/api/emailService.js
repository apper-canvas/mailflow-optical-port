import emailsData from "@/services/mockData/emails.json";

let emails = [...emailsData];

// Callback system for notifying components of data changes
let changeCallbacks = [];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const emailService = {
  async getAll() {
    await delay(300);
    return [...emails];
  },

  async getById(id) {
    await delay(200);
    const email = emails.find(email => email.Id === parseInt(id));
    if (!email) {
      throw new Error("Email not found");
    }
    return { ...email };
  },

  async getByFolder(folder) {
    await delay(250);
    if (folder === "starred") {
      return emails.filter(email => email.isStarred).map(email => ({ ...email }));
    }
    return emails.filter(email => email.folder === folder).map(email => ({ ...email }));
  },

  async search(query) {
    await delay(300);
    const searchTerm = query.toLowerCase();
    return emails.filter(email => 
      email.subject.toLowerCase().includes(searchTerm) ||
      email.body.toLowerCase().includes(searchTerm) ||
      email.fromName.toLowerCase().includes(searchTerm) ||
      email.from.toLowerCase().includes(searchTerm)
    ).map(email => ({ ...email }));
  },

  async create(emailData) {
    await delay(400);
    const maxId = emails.length > 0 ? Math.max(...emails.map(e => e.Id)) : 0;
    const newEmail = {
      Id: maxId + 1,
      from: "me@mailflow.com",
      fromName: "Me",
      to: emailData.to || [],
      cc: emailData.cc || [],
      bcc: emailData.bcc || [],
      subject: emailData.subject || "",
      body: emailData.body || "",
      timestamp: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      folder: emailData.folder || "sent",
      threadId: `thread_${maxId + 1}`,
      hasAttachments: false
    };
    emails.push(newEmail);
    return { ...newEmail };
  },

  async update(id, updates) {
    await delay(200);
    const index = emails.findIndex(email => email.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Email not found");
    }
    emails[index] = { ...emails[index], ...updates };
    return { ...emails[index] };
  },

  async delete(id) {
    await delay(200);
    const index = emails.findIndex(email => email.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Email not found");
    }
    
    if (emails[index].folder === "trash") {
      // Permanently delete
      emails.splice(index, 1);
      return { success: true, message: "Email permanently deleted" };
    } else {
      // Move to trash
      emails[index].folder = "trash";
      return { ...emails[index] };
    }
  },

  async markAsRead(id) {
    await delay(150);
    return this.update(id, { isRead: true });
  },

  async markAsUnread(id) {
    await delay(150);
    return this.update(id, { isRead: false });
  },

  async toggleStar(id) {
    await delay(150);
    const email = emails.find(email => email.Id === parseInt(id));
    if (!email) {
      throw new Error("Email not found");
    }
    return this.update(id, { isStarred: !email.isStarred });
  },

  async saveDraft(draftData) {
    await delay(300);
    const existingDraft = emails.find(email => 
      email.folder === "drafts" && email.subject === draftData.subject
    );

    if (existingDraft) {
      return this.update(existingDraft.Id, {
        to: draftData.to || [],
        cc: draftData.cc || [],
        bcc: draftData.bcc || [],
        subject: draftData.subject || "",
        body: draftData.body || "",
        timestamp: new Date().toISOString()
      });
    } else {
      return this.create({
        ...draftData,
        folder: "drafts"
});
    }
  },

  // Callback management for data change notifications
  registerCallback(callback) {
    changeCallbacks.push(callback);
    return () => {
      changeCallbacks = changeCallbacks.filter(cb => cb !== callback);
    };
  },

  // Notify all registered callbacks of data changes
  notifyChange() {
    changeCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in change callback:', error);
      }
    });
  }
};

// Helper function to notify change and delay
const notifyAndDelay = async (ms = 200) => {
  emailService.notifyChange();
  await delay(ms);
};

// Override existing methods to include notifications
const originalCreate = emailService.create;
emailService.create = async function(email) {
  const result = await originalCreate.call(this, email);
  this.notifyChange();
  return result;
};

const originalUpdate = emailService.update;
emailService.update = async function(id, updates) {
  const result = await originalUpdate.call(this, id, updates);
  this.notifyChange();
  return result;
};

const originalDelete = emailService.delete;
emailService.delete = async function(id) {
  const result = await originalDelete.call(this, id);
  this.notifyChange();
  return result;
};

const originalMove = emailService.move;
emailService.move = async function(emailId, targetFolder) {
  const result = await originalMove.call(this, emailId, targetFolder);
  this.notifyChange();
  return result;
};

const originalToggleStar = emailService.toggleStar;
emailService.toggleStar = async function(emailId) {
  const result = await originalToggleStar.call(this, emailId);
  this.notifyChange();
  return result;
};

const originalMarkAsRead = emailService.markAsRead;
emailService.markAsRead = async function(emailId) {
  const result = await originalMarkAsRead.call(this, emailId);
  this.notifyChange();
  return result;
};

const originalMarkAsUnread = emailService.markAsUnread;
emailService.markAsUnread = async function(emailId) {
  const result = await originalMarkAsUnread.call(this, emailId);
  this.notifyChange();
  return result;
};

export default emailService;