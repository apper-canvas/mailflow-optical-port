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

const emailService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "from_c"}},
          {"field": {"Name": "from_name_c"}},
          {"field": {"Name": "to_c"}},
          {"field": {"Name": "cc_c"}},
          {"field": {"Name": "bcc_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "body_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "is_read_c"}},
          {"field": {"Name": "is_starred_c"}},
          {"field": {"Name": "folder_c"}},
          {"field": {"Name": "thread_id_c"}},
          {"field": {"Name": "has_attachments_c"}}
        ],
        orderBy: [{"fieldName": "timestamp_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };
      
      const response = await apperClient.fetchRecords('email_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      if (!response.data || response.data.length === 0) {
        return [];
      }
      
      // Transform database fields to expected format
      return response.data.map(email => ({
        Id: email.Id,
        from: email.from_c || "",
        fromName: email.from_name_c || "",
        to: email.to_c ? (typeof email.to_c === 'string' ? email.to_c.split(',').map(e => e.trim()) : email.to_c) : [],
        cc: email.cc_c ? (typeof email.cc_c === 'string' ? email.cc_c.split(',').map(e => e.trim()) : email.cc_c) : [],
        bcc: email.bcc_c ? (typeof email.bcc_c === 'string' ? email.bcc_c.split(',').map(e => e.trim()) : email.bcc_c) : [],
        subject: email.subject_c || "",
        body: email.body_c || "",
        timestamp: email.timestamp_c || new Date().toISOString(),
        isRead: email.is_read_c || false,
        isStarred: email.is_starred_c || false,
        folder: email.folder_c || "inbox",
        threadId: email.thread_id_c || "",
        hasAttachments: email.has_attachments_c || false
      }));
    } catch (error) {
      console.error("Error fetching emails:", error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "from_c"}},
          {"field": {"Name": "from_name_c"}},
          {"field": {"Name": "to_c"}},
          {"field": {"Name": "cc_c"}},
          {"field": {"Name": "bcc_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "body_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "is_read_c"}},
          {"field": {"Name": "is_starred_c"}},
          {"field": {"Name": "folder_c"}},
          {"field": {"Name": "thread_id_c"}},
          {"field": {"Name": "has_attachments_c"}}
        ]
      };
      
      const response = await apperClient.getRecordById('email_c', parseInt(id), params);
      
      if (!response.success || !response.data) {
        throw new Error("Email not found");
      }
      
      const email = response.data;
      // Transform database fields to expected format
      return {
        Id: email.Id,
        from: email.from_c || "",
        fromName: email.from_name_c || "",
        to: email.to_c ? (typeof email.to_c === 'string' ? email.to_c.split(',').map(e => e.trim()) : email.to_c) : [],
        cc: email.cc_c ? (typeof email.cc_c === 'string' ? email.cc_c.split(',').map(e => e.trim()) : email.cc_c) : [],
        bcc: email.bcc_c ? (typeof email.bcc_c === 'string' ? email.bcc_c.split(',').map(e => e.trim()) : email.bcc_c) : [],
        subject: email.subject_c || "",
        body: email.body_c || "",
        timestamp: email.timestamp_c || new Date().toISOString(),
        isRead: email.is_read_c || false,
        isStarred: email.is_starred_c || false,
        folder: email.folder_c || "inbox",
        threadId: email.thread_id_c || "",
        hasAttachments: email.has_attachments_c || false
      };
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
          {"field": {"Name": "Name"}},
          {"field": {"Name": "from_c"}},
          {"field": {"Name": "from_name_c"}},
          {"field": {"Name": "to_c"}},
          {"field": {"Name": "cc_c"}},
          {"field": {"Name": "bcc_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "body_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "is_read_c"}},
          {"field": {"Name": "is_starred_c"}},
          {"field": {"Name": "folder_c"}},
          {"field": {"Name": "thread_id_c"}},
          {"field": {"Name": "has_attachments_c"}}
        ],
        orderBy: [{"fieldName": "timestamp_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };
      
      if (folder === "starred") {
        params.where = [{"FieldName": "is_starred_c", "Operator": "ExactMatch", "Values": [true]}];
      } else {
        params.where = [{"FieldName": "folder_c", "Operator": "ExactMatch", "Values": [folder]}];
      }
      
      const response = await apperClient.fetchRecords('email_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      if (!response.data || response.data.length === 0) {
        return [];
      }
      
      // Transform database fields to expected format
      return response.data.map(email => ({
        Id: email.Id,
        from: email.from_c || "",
        fromName: email.from_name_c || "",
        to: email.to_c ? (typeof email.to_c === 'string' ? email.to_c.split(',').map(e => e.trim()) : email.to_c) : [],
        cc: email.cc_c ? (typeof email.cc_c === 'string' ? email.cc_c.split(',').map(e => e.trim()) : email.cc_c) : [],
        bcc: email.bcc_c ? (typeof email.bcc_c === 'string' ? email.bcc_c.split(',').map(e => e.trim()) : email.bcc_c) : [],
        subject: email.subject_c || "",
        body: email.body_c || "",
        timestamp: email.timestamp_c || new Date().toISOString(),
        isRead: email.is_read_c || false,
        isStarred: email.is_starred_c || false,
        folder: email.folder_c || "inbox",
        threadId: email.thread_id_c || "",
        hasAttachments: email.has_attachments_c || false
      }));
    } catch (error) {
      console.error("Error fetching emails by folder:", error);
      return [];
    }
  },

  async search(query) {
    try {
      const apperClient = getApperClient();
      const searchTerm = query.trim().toLowerCase();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "from_c"}},
          {"field": {"Name": "from_name_c"}},
          {"field": {"Name": "to_c"}},
          {"field": {"Name": "cc_c"}},
          {"field": {"Name": "bcc_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "body_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "is_read_c"}},
          {"field": {"Name": "is_starred_c"}},
          {"field": {"Name": "folder_c"}},
          {"field": {"Name": "thread_id_c"}},
          {"field": {"Name": "has_attachments_c"}}
        ],
        whereGroups: [{
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [
                {"fieldName": "subject_c", "operator": "Contains", "values": [searchTerm]}
              ],
              "operator": "OR"
            },
            {
              "conditions": [
                {"fieldName": "body_c", "operator": "Contains", "values": [searchTerm]}
              ],
              "operator": "OR"
            },
            {
              "conditions": [
                {"fieldName": "from_name_c", "operator": "Contains", "values": [searchTerm]}
              ],
              "operator": "OR"
            },
            {
              "conditions": [
                {"fieldName": "from_c", "operator": "Contains", "values": [searchTerm]}
              ],
              "operator": "OR"
            }
          ]
        }],
        orderBy: [{"fieldName": "timestamp_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };
      
      const response = await apperClient.fetchRecords('email_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      if (!response.data || response.data.length === 0) {
        return [];
      }
      
      // Transform database fields to expected format
      return response.data.map(email => ({
        Id: email.Id,
        from: email.from_c || "",
        fromName: email.from_name_c || "",
        to: email.to_c ? (typeof email.to_c === 'string' ? email.to_c.split(',').map(e => e.trim()) : email.to_c) : [],
        cc: email.cc_c ? (typeof email.cc_c === 'string' ? email.cc_c.split(',').map(e => e.trim()) : email.cc_c) : [],
        bcc: email.bcc_c ? (typeof email.bcc_c === 'string' ? email.bcc_c.split(',').map(e => e.trim()) : email.bcc_c) : [],
        subject: email.subject_c || "",
        body: email.body_c || "",
        timestamp: email.timestamp_c || new Date().toISOString(),
        isRead: email.is_read_c || false,
        isStarred: email.is_starred_c || false,
        folder: email.folder_c || "inbox",
        threadId: email.thread_id_c || "",
        hasAttachments: email.has_attachments_c || false
      }));
    } catch (error) {
      console.error("Error searching emails:", error);
      return [];
    }
  },

  async create(emailData) {
    try {
      const apperClient = getApperClient();
      
      // Transform to database field format
      const dbData = {
        Name: emailData.subject || "New Email",
        from_c: "me@mailflow.com",
        from_name_c: "Me",
        to_c: Array.isArray(emailData.to) ? emailData.to.join(", ") : (emailData.to || ""),
        cc_c: Array.isArray(emailData.cc) ? emailData.cc.join(", ") : (emailData.cc || ""),
        bcc_c: Array.isArray(emailData.bcc) ? emailData.bcc.join(", ") : (emailData.bcc || ""),
        subject_c: emailData.subject || "",
        body_c: emailData.body || "",
        timestamp_c: new Date().toISOString(),
        is_read_c: true,
        is_starred_c: false,
        folder_c: emailData.folder || "sent",
        thread_id_c: `thread_${Date.now()}`,
        has_attachments_c: false
      };
      
      const params = {
        records: [dbData]
      };
      
      const response = await apperClient.createRecord('email_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create email:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          this.notifyChange();
          const created = successful[0].data;
          return {
            Id: created.Id,
            from: created.from_c || "",
            fromName: created.from_name_c || "",
            to: created.to_c ? created.to_c.split(',').map(e => e.trim()) : [],
            cc: created.cc_c ? created.cc_c.split(',').map(e => e.trim()) : [],
            bcc: created.bcc_c ? created.bcc_c.split(',').map(e => e.trim()) : [],
            subject: created.subject_c || "",
            body: created.body_c || "",
            timestamp: created.timestamp_c || new Date().toISOString(),
            isRead: created.is_read_c || false,
            isStarred: created.is_starred_c || false,
            folder: created.folder_c || "sent",
            threadId: created.thread_id_c || "",
            hasAttachments: created.has_attachments_c || false
          };
        }
      }
      
      throw new Error("Failed to create email");
    } catch (error) {
      console.error("Error creating email:", error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const apperClient = getApperClient();
      
      // Transform updates to database field format
      const dbUpdates = {
        Id: parseInt(id)
      };
      
      if (updates.hasOwnProperty('isRead')) dbUpdates.is_read_c = updates.isRead;
      if (updates.hasOwnProperty('isStarred')) dbUpdates.is_starred_c = updates.isStarred;
      if (updates.hasOwnProperty('folder')) dbUpdates.folder_c = updates.folder;
      if (updates.hasOwnProperty('subject')) dbUpdates.subject_c = updates.subject;
      if (updates.hasOwnProperty('body')) dbUpdates.body_c = updates.body;
      if (updates.hasOwnProperty('to')) dbUpdates.to_c = Array.isArray(updates.to) ? updates.to.join(", ") : updates.to;
      if (updates.hasOwnProperty('cc')) dbUpdates.cc_c = Array.isArray(updates.cc) ? updates.cc.join(", ") : updates.cc;
      if (updates.hasOwnProperty('bcc')) dbUpdates.bcc_c = Array.isArray(updates.bcc) ? updates.bcc.join(", ") : updates.bcc;
      
      const params = {
        records: [dbUpdates]
      };
      
      const response = await apperClient.updateRecord('email_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update email:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          this.notifyChange();
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            from: updated.from_c || "",
            fromName: updated.from_name_c || "",
            to: updated.to_c ? updated.to_c.split(',').map(e => e.trim()) : [],
            cc: updated.cc_c ? updated.cc_c.split(',').map(e => e.trim()) : [],
            bcc: updated.bcc_c ? updated.bcc_c.split(',').map(e => e.trim()) : [],
            subject: updated.subject_c || "",
            body: updated.body_c || "",
            timestamp: updated.timestamp_c || new Date().toISOString(),
            isRead: updated.is_read_c || false,
            isStarred: updated.is_starred_c || false,
            folder: updated.folder_c || "inbox",
            threadId: updated.thread_id_c || "",
            hasAttachments: updated.has_attachments_c || false
          };
        }
      }
      
      throw new Error("Failed to update email");
    } catch (error) {
      console.error("Error updating email:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      
      // First get the current email to check folder
      const email = await this.getById(id);
      
      if (email.folder === "trash") {
        // Permanently delete
        const params = {
          RecordIds: [parseInt(id)]
        };
        
        const response = await apperClient.deleteRecord('email_c', params);
        
        if (!response.success) {
          console.error(response.message);
          toast.error(response.message);
          throw new Error(response.message);
        }
        
        this.notifyChange();
        return { success: true, message: "Email permanently deleted" };
      } else {
        // Move to trash
        const updated = await this.update(id, { folder: "trash" });
        return updated;
      }
    } catch (error) {
      console.error("Error deleting email:", error);
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
      // Check for existing draft with same subject
      const existingDrafts = await this.getByFolder("drafts");
      const existingDraft = existingDrafts.find(email => 
        email.subject === draftData.subject && draftData.subject.trim() !== ""
      );

      if (existingDraft) {
        return this.update(existingDraft.Id, {
          to: draftData.to || [],
          cc: draftData.cc || [],
          bcc: draftData.bcc || [],
          subject: draftData.subject || "",
          body: draftData.body || ""
        });
      } else {
        return this.create({
          ...draftData,
          folder: "drafts"
        });
      }
    } catch (error) {
      console.error("Error saving draft:", error);
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