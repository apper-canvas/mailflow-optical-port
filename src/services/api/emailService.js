import { toast } from "react-toastify";

// Callback system for notifying components of data changes
let changeCallbacks = [];

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Helper function to map database fields to UI format
const mapEmailFromDatabase = (email) => {
  if (!email) return null;
  
  return {
    Id: email.Id,
    from: email.sender_email_c || email.from_email_c || "",
    fromName: email.sender_name_c || email.from_name_c || "",
    to: email.recipient_emails_c ? email.recipient_emails_c.split(',') : [],
    cc: email.cc_emails_c ? email.cc_emails_c.split(',') : [],
    bcc: email.bcc_emails_c ? email.bcc_emails_c.split(',') : [],
    subject: email.subject_c || "",
    body: email.body_c || "",
    timestamp: email.sent_date_c || email.created_date_c || new Date().toISOString(),
    isRead: email.is_read_c || false,
    isStarred: email.is_starred_c || false,
    folder: email.folder_c || "inbox",
    threadId: email.thread_id_c || `thread_${email.Id}`,
    hasAttachments: email.has_attachments_c || false
  };
};

// Helper function to map UI format to database fields for create/update
const mapEmailToDatabase = (email) => {
  const dbEmail = {};
  
  // Only include updateable fields based on database schema
  if (email.sender_email_c !== undefined) dbEmail.sender_email_c = email.sender_email_c;
  if (email.sender_name_c !== undefined) dbEmail.sender_name_c = email.sender_name_c;
  if (email.recipient_emails_c !== undefined) dbEmail.recipient_emails_c = email.recipient_emails_c;
  if (email.cc_emails_c !== undefined) dbEmail.cc_emails_c = email.cc_emails_c;
  if (email.bcc_emails_c !== undefined) dbEmail.bcc_emails_c = email.bcc_emails_c;
  if (email.subject_c !== undefined) dbEmail.subject_c = email.subject_c;
  if (email.body_c !== undefined) dbEmail.body_c = email.body_c;
  if (email.sent_date_c !== undefined) dbEmail.sent_date_c = email.sent_date_c;
  if (email.is_read_c !== undefined) dbEmail.is_read_c = email.is_read_c;
  if (email.is_starred_c !== undefined) dbEmail.is_starred_c = email.is_starred_c;
  if (email.folder_c !== undefined) dbEmail.folder_c = email.folder_c;
  if (email.thread_id_c !== undefined) dbEmail.thread_id_c = email.thread_id_c;
  if (email.has_attachments_c !== undefined) dbEmail.has_attachments_c = email.has_attachments_c;
  
  return dbEmail;
};
const emailService = {
async getAll() {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "sender_email_c"}},
          {"field": {"Name": "sender_name_c"}},
          {"field": {"Name": "recipient_emails_c"}},
          {"field": {"Name": "cc_emails_c"}},
          {"field": {"Name": "bcc_emails_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "body_c"}},
          {"field": {"Name": "sent_date_c"}},
          {"field": {"Name": "is_read_c"}},
          {"field": {"Name": "is_starred_c"}},
          {"field": {"Name": "folder_c"}},
          {"field": {"Name": "thread_id_c"}},
          {"field": {"Name": "has_attachments_c"}},
          {"field": {"Name": "created_date_c"}}
        ],
        orderBy: [{"fieldName": "sent_date_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await apperClient.fetchRecords("email_c", params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      const emails = (response.data || []).map(mapEmailFromDatabase);
      return emails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast.error("Failed to fetch emails");
      return [];
    }
  },

async getById(id) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "sender_email_c"}},
          {"field": {"Name": "sender_name_c"}},
          {"field": {"Name": "recipient_emails_c"}},
          {"field": {"Name": "cc_emails_c"}},
          {"field": {"Name": "bcc_emails_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "body_c"}},
          {"field": {"Name": "sent_date_c"}},
          {"field": {"Name": "is_read_c"}},
          {"field": {"Name": "is_starred_c"}},
          {"field": {"Name": "folder_c"}},
          {"field": {"Name": "thread_id_c"}},
          {"field": {"Name": "has_attachments_c"}},
          {"field": {"Name": "created_date_c"}}
        ]
      };

      const response = await apperClient.getRecordById("email_c", parseInt(id), params);

      if (!response.success) {
        console.error(response.message);
        throw new Error("Email not found");
      }

      if (!response.data) {
        throw new Error("Email not found");
      }

      return mapEmailFromDatabase(response.data);
    } catch (error) {
      console.error(`Error fetching email ${id}:`, error);
      throw new Error("Email not found");
    }
  },

async getByFolder(folder) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "sender_email_c"}},
          {"field": {"Name": "sender_name_c"}},
          {"field": {"Name": "recipient_emails_c"}},
          {"field": {"Name": "cc_emails_c"}},
          {"field": {"Name": "bcc_emails_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "body_c"}},
          {"field": {"Name": "sent_date_c"}},
          {"field": {"Name": "is_read_c"}},
          {"field": {"Name": "is_starred_c"}},
          {"field": {"Name": "folder_c"}},
          {"field": {"Name": "thread_id_c"}},
          {"field": {"Name": "has_attachments_c"}},
          {"field": {"Name": "created_date_c"}}
        ],
        orderBy: [{"fieldName": "sent_date_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      // Handle special folder cases
      if (folder === 'starred') {
        params.whereGroups = [{
          "operator": "AND",
          "subGroups": [
            {
              "conditions": [
                {"fieldName": "is_starred_c", "operator": "ExactMatch", "values": [true]},
                {"fieldName": "folder_c", "operator": "NotEqualTo", "values": ["trash"]}
              ],
              "operator": "AND"
            }
          ]
        }];
      } else {
        params.where = [
          {"FieldName": "folder_c", "Operator": "ExactMatch", "Values": [folder]}
        ];
      }

      const response = await apperClient.fetchRecords("email_c", params);

      if (!response.success) {
        console.error(response.message);
        toast.error(`Failed to fetch ${folder} emails`);
        return [];
      }

      const emails = (response.data || []).map(mapEmailFromDatabase);
      return emails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error("Error fetching emails by folder:", error);
      toast.error(`Failed to fetch ${folder} emails`);
      return [];
    }
  },

async search(query) {
    try {
      const searchTerm = query.trim().toLowerCase();
      
      if (!searchTerm) {
        return this.getAll();
      }

      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "sender_email_c"}},
          {"field": {"Name": "sender_name_c"}},
          {"field": {"Name": "recipient_emails_c"}},
          {"field": {"Name": "cc_emails_c"}},
          {"field": {"Name": "bcc_emails_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "body_c"}},
          {"field": {"Name": "sent_date_c"}},
          {"field": {"Name": "is_read_c"}},
          {"field": {"Name": "is_starred_c"}},
          {"field": {"Name": "folder_c"}},
          {"field": {"Name": "thread_id_c"}},
          {"field": {"Name": "has_attachments_c"}},
          {"field": {"Name": "created_date_c"}}
        ],
        whereGroups: [{
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [
                {"fieldName": "subject_c", "operator": "Contains", "values": [searchTerm]},
                {"fieldName": "body_c", "operator": "Contains", "values": [searchTerm]},
                {"fieldName": "sender_email_c", "operator": "Contains", "values": [searchTerm]},
                {"fieldName": "sender_name_c", "operator": "Contains", "values": [searchTerm]},
                {"fieldName": "recipient_emails_c", "operator": "Contains", "values": [searchTerm]}
              ],
              "operator": "OR"
            }
          ]
        }],
        orderBy: [{"fieldName": "sent_date_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await apperClient.fetchRecords("email_c", params);

      if (!response.success) {
        console.error(response.message);
        toast.error("Failed to search emails");
        return [];
      }

      const emails = (response.data || []).map(mapEmailFromDatabase);
      return emails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error("Error searching emails:", error);
      toast.error("Failed to search emails");
      return [];
    }
  },

async create(emailData) {
    try {
      const apperClient = getApperClient();
      
      // Prepare email data using only updateable fields
      const dbEmail = {
        sender_email_c: "user@mailflow.com",
        sender_name_c: "You",
        recipient_emails_c: Array.isArray(emailData.to) ? emailData.to.join(',') : emailData.to,
        cc_emails_c: emailData.cc ? (Array.isArray(emailData.cc) ? emailData.cc.join(',') : emailData.cc) : "",
        bcc_emails_c: emailData.bcc ? (Array.isArray(emailData.bcc) ? emailData.bcc.join(',') : emailData.bcc) : "",
        subject_c: emailData.subject || "(No Subject)",
        body_c: emailData.body || "",
        sent_date_c: new Date().toISOString(),
        is_read_c: true,
        is_starred_c: false,
        folder_c: "sent",
        thread_id_c: `thread_${Date.now()}`,
        has_attachments_c: false
      };

      const params = {
        records: [dbEmail]
      };

      const response = await apperClient.createRecord("email_c", params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create email:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          this.notifyChange();
          toast.success("Email sent successfully!");
          return mapEmailFromDatabase(successful[0].data);
        }
      }

      throw new Error("Failed to create email");
    } catch (error) {
      console.error("Error creating email:", error);
      toast.error("Failed to send email");
      throw error;
    }
  },

async update(id, updates) {
    try {
      const apperClient = getApperClient();
      
      // Map UI updates to database fields (only updateable fields)
      const dbUpdates = {};
      
      if (updates.from) dbUpdates.sender_email_c = updates.from;
      if (updates.fromName) dbUpdates.sender_name_c = updates.fromName;
      if (updates.to) dbUpdates.recipient_emails_c = Array.isArray(updates.to) ? updates.to.join(',') : updates.to;
      if (updates.cc) dbUpdates.cc_emails_c = Array.isArray(updates.cc) ? updates.cc.join(',') : updates.cc;
      if (updates.bcc) dbUpdates.bcc_emails_c = Array.isArray(updates.bcc) ? updates.bcc.join(',') : updates.bcc;
      if (updates.subject) dbUpdates.subject_c = updates.subject;
      if (updates.body) dbUpdates.body_c = updates.body;
      if (updates.isRead !== undefined) dbUpdates.is_read_c = updates.isRead;
      if (updates.isStarred !== undefined) dbUpdates.is_starred_c = updates.isStarred;
      if (updates.folder) dbUpdates.folder_c = updates.folder;
      if (updates.hasAttachments !== undefined) dbUpdates.has_attachments_c = updates.hasAttachments;

      const params = {
        records: [{
          Id: parseInt(id),
          ...dbUpdates
        }]
      };

      const response = await apperClient.updateRecord("email_c", params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update email:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          this.notifyChange();
          return mapEmailFromDatabase(successful[0].data);
        }
      }

      throw new Error("Failed to update email");
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error("Failed to update email");
      throw error;
    }
  },

async delete(id) {
    try {
      const apperClient = getApperClient();
      
      // First, get the current email to check its folder
      const currentEmail = await this.getById(id);
      
      if (currentEmail.folder === "trash") {
        // Permanently delete
        const params = { 
          RecordIds: [parseInt(id)]
        };
        
        const response = await apperClient.deleteRecord("email_c", params);
        
        if (!response.success) {
          console.error(response.message);
          toast.error(response.message);
          throw new Error(response.message);
        }

        if (response.results) {
          const successful = response.results.filter(r => r.success);
          const failed = response.results.filter(r => !r.success);
          
          if (failed.length > 0) {
            console.error(`Failed to delete email:`, failed);
            failed.forEach(record => {
              if (record.message) toast.error(record.message);
            });
          }
          
          if (successful.length > 0) {
            this.notifyChange();
            toast.success("Email permanently deleted");
            return { success: true, message: "Email permanently deleted" };
          }
        }
      } else {
        // Move to trash
        const updatedEmail = await this.update(id, { folder: "trash" });
        toast.success("Email moved to trash");
        return updatedEmail;
      }
    } catch (error) {
      console.error("Error deleting email:", error);
      toast.error("Failed to delete email");
      throw error;
    }
  },

  async markAsRead(id) {
    return this.update(id, { isRead: true });
  },

  async markAsUnread(id) {
    return this.update(id, { isRead: false });
  },

  async toggleStar(id) {
    try {
      const email = await this.getById(id);
      return this.update(id, { isStarred: !email.isStarred });
    } catch (error) {
      console.error("Error toggling star:", error);
      throw error;
    }
  },

async saveDraft(draftData) {
    try {
      const apperClient = getApperClient();
      
      // Check for existing draft with same subject
      const params = {
        fields: [{"field": {"Name": "Id"}}, {"field": {"Name": "subject_c"}}],
        where: [
          {"FieldName": "folder_c", "Operator": "ExactMatch", "Values": ["drafts"]},
          {"FieldName": "subject_c", "Operator": "ExactMatch", "Values": [draftData.subject || "(No Subject)"]}
        ],
        pagingInfo: {"limit": 1, "offset": 0}
      };

      const existingResponse = await apperClient.fetchRecords("email_c", params);
      
      if (existingResponse.success && existingResponse.data && existingResponse.data.length > 0) {
        // Update existing draft
        const existingId = existingResponse.data[0].Id;
        const updatedDraft = await this.update(existingId, {
          to: Array.isArray(draftData.to) ? draftData.to : [draftData.to],
          cc: draftData.cc || [],
          bcc: draftData.bcc || [],
          subject: draftData.subject || "(No Subject)",
          body: draftData.body || ""
        });
        
        toast.success("Draft updated");
        return updatedDraft;
      } else {
        // Create new draft
        const dbDraft = {
          sender_email_c: "user@mailflow.com",
          sender_name_c: "You",
          recipient_emails_c: Array.isArray(draftData.to) ? draftData.to.join(',') : draftData.to || "",
          cc_emails_c: draftData.cc ? (Array.isArray(draftData.cc) ? draftData.cc.join(',') : draftData.cc) : "",
          bcc_emails_c: draftData.bcc ? (Array.isArray(draftData.bcc) ? draftData.bcc.join(',') : draftData.bcc) : "",
          subject_c: draftData.subject || "(No Subject)",
          body_c: draftData.body || "",
          sent_date_c: new Date().toISOString(),
          is_read_c: true,
          is_starred_c: false,
          folder_c: "drafts",
          thread_id_c: `thread_${Date.now()}`,
          has_attachments_c: false
        };

        const createParams = {
          records: [dbDraft]
        };

        const response = await apperClient.createRecord("email_c", createParams);

        if (!response.success) {
          console.error(response.message);
          toast.error(response.message);
          throw new Error(response.message);
        }

        if (response.results && response.results[0] && response.results[0].success) {
          this.notifyChange();
          toast.success("Draft saved");
          return mapEmailFromDatabase(response.results[0].data);
        }
      }

      throw new Error("Failed to save draft");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft");
      throw error;
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

export default emailService;