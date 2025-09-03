import { toast } from "react-toastify";

// Callback system for notifying components of data changes
let changeCallbacks = [];

// Gmail API Configuration
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify'
];

// Gmail API client initialization
let gmailClient = null;
let isGmailAuthenticated = false;
let authInstance = null;
let initializationPromise = null;
const initGmailClient = async () => {
  // Return existing promise if initialization is already in progress
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      // Validate environment variables
      const apiKey = import.meta.env.VITE_GMAIL_API_KEY;
      const clientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
      
      if (!apiKey || !clientId) {
        throw new Error("Gmail API credentials not configured. Please check VITE_GMAIL_API_KEY and VITE_GMAIL_CLIENT_ID environment variables.");
      }

      // Load GAPI script if not already loaded
      if (!window.gapi) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error("Failed to load Gmail API script"));
          document.head.appendChild(script);
          
          // Set timeout for script loading
          setTimeout(() => reject(new Error("Gmail API script load timeout")), 10000);
        });
      }

      // Load GAPI client and auth2
      await new Promise((resolve, reject) => {
        window.gapi.load('client:auth2', {
          callback: resolve,
          onerror: () => reject(new Error("Failed to load Gmail API client"))
        });
      });

      // Initialize GAPI client
      await window.gapi.client.init({
        apiKey,
        clientId,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
        scope: GMAIL_SCOPES.join(' ')
      });

      gmailClient = window.gapi.client.gmail;
      authInstance = window.gapi.auth2.getAuthInstance();
      
      if (!authInstance) {
        throw new Error("Gmail auth instance not available after initialization");
      }
      
      // Check initial authentication status
      isGmailAuthenticated = authInstance.isSignedIn.get();
      
      return gmailClient;
    } catch (error) {
      // Reset initialization promise on failure to allow retry
      initializationPromise = null;
      gmailClient = null;
      authInstance = null;
      isGmailAuthenticated = false;
      throw error;
    }
  })();

  return initializationPromise;
};

const ensureGmailAuth = async () => {
  try {
    // Initialize Gmail client if not already done
    if (!gmailClient || !authInstance) {
      await initGmailClient();
    }
    
    // Double-check auth instance is available
    if (!authInstance) {
      throw new Error("Gmail authentication not initialized. Please check your API configuration.");
    }
    
    // Check if already authenticated
    if (isGmailAuthenticated && authInstance.isSignedIn.get()) {
      return gmailClient;
    }
    
    // Attempt authentication
    if (!authInstance.isSignedIn.get()) {
      try {
        await authInstance.signIn({
          prompt: 'consent'
        });
        isGmailAuthenticated = true;
        toast.success("Gmail access granted successfully");
      } catch (authError) {
        isGmailAuthenticated = false;
        
        // Handle different types of authentication errors
        if (authError.error === 'popup_closed_by_user') {
          toast.error("Gmail authentication cancelled by user");
          throw new Error("Gmail authentication cancelled");
        } else if (authError.error === 'access_denied') {
          toast.error("Gmail access denied. Please grant permissions to continue.");
          throw new Error("Gmail access denied");
        } else {
          toast.error("Gmail authentication failed. Please try again.");
          throw new Error(`Gmail authentication failed: ${authError.details || authError.error || authError.message}`);
        }
      }
    } else {
      isGmailAuthenticated = true;
    }
    
    return gmailClient;
  } catch (error) {
    console.error("Gmail authentication error:", error);
    
    // Provide user-friendly error messages
    if (error.message.includes('credentials not configured')) {
      toast.error("Gmail integration not configured. Contact administrator.");
    } else if (error.message.includes('script load')) {
      toast.error("Unable to load Gmail API. Check internet connection.");
    } else if (!error.message.includes('authentication')) {
      toast.error("Gmail service temporarily unavailable. Please try again.");
    }
    
    throw error;
  }
};

// Helper to convert Gmail message to our format
const convertGmailMessage = (gmailMessage) => {
  const headers = gmailMessage.payload?.headers || [];
  const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
  
  const getBody = (payload) => {
    if (payload.body?.data) {
      return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
    
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
          if (part.body?.data) {
            return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          }
        }
      }
    }
    
    return '';
  };

  const labelMap = {
    'INBOX': 'inbox',
    'SENT': 'sent', 
    'DRAFT': 'drafts',
    'STARRED': 'starred',
    'TRASH': 'trash'
  };

  const folder = gmailMessage.labelIds?.find(label => labelMap[label]) || 'inbox';
  const mappedFolder = labelMap[folder] || 'inbox';

  return {
    Id: parseInt(gmailMessage.id.slice(-8), 16), // Convert Gmail ID to integer
    from: getHeader('From').replace(/.*<(.+)>.*/, '$1'),
    fromName: getHeader('From').replace(/^([^<]+).*/, '$1').trim(),
    to: getHeader('To').split(',').map(email => email.trim()),
    cc: getHeader('Cc').split(',').map(email => email.trim()).filter(Boolean),
    bcc: getHeader('Bcc').split(',').map(email => email.trim()).filter(Boolean),
    subject: getHeader('Subject'),
    body: getBody(gmailMessage.payload),
    timestamp: new Date(parseInt(gmailMessage.internalDate)).toISOString(),
    isRead: !gmailMessage.labelIds?.includes('UNREAD'),
    isStarred: gmailMessage.labelIds?.includes('STARRED') || false,
    folder: mappedFolder,
    threadId: gmailMessage.threadId,
    hasAttachments: gmailMessage.payload?.parts?.some(part => part.filename) || false,
    gmailId: gmailMessage.id // Keep original Gmail ID for API calls
  };
};

// Helper to create RFC 2822 email format for sending
const createRFC2822Email = (emailData) => {
  const to = Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to;
  const cc = emailData.cc && emailData.cc.length > 0 ? 
    (Array.isArray(emailData.cc) ? emailData.cc.join(', ') : emailData.cc) : '';
  const bcc = emailData.bcc && emailData.bcc.length > 0 ? 
    (Array.isArray(emailData.bcc) ? emailData.bcc.join(', ') : emailData.bcc) : '';

  let email = [
    `To: ${to}`,
    cc ? `Cc: ${cc}` : '',
    bcc ? `Bcc: ${bcc}` : '',
    `Subject: ${emailData.subject || '(No Subject)'}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    emailData.body || ''
  ].filter(Boolean).join('\r\n');

  return btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const emailService = {
  async getAll() {
    try {
      const gmail = await ensureGmailAuth();
      
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 100,
        q: '' // Get all messages
      });

      if (!response.result?.messages) {
        return [];
      }

      // Get full message details for each message
      const messages = await Promise.all(
        response.result.messages.map(async (msg) => {
          const fullMessage = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'full'
          });
          return convertGmailMessage(fullMessage.result);
        })
      );

      return messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast.error("Failed to fetch emails from Gmail");
      return [];
    }
  },

async getById(id) {
    try {
      const gmail = await ensureGmailAuth();
      
      // First try to find by our converted ID, then search all messages
      const allMessages = await this.getAll();
      const emailById = allMessages.find(email => email.Id === parseInt(id));
      
      if (emailById && emailById.gmailId) {
        // Get full message using Gmail ID
        const response = await gmail.users.messages.get({
          userId: 'me',
          id: emailById.gmailId,
          format: 'full'
        });
        
        return convertGmailMessage(response.result);
      }
      
      throw new Error("Email not found");
    } catch (error) {
      console.error(`Error fetching email ${id}:`, error);
      throw new Error("Email not found");
    }
  },

async getByFolder(folder) {
try {
      const gmail = await ensureGmailAuth();
      
      const folderLabelMap = {
        'inbox': 'INBOX',
        'sent': 'SENT',
        'drafts': 'DRAFT',
        'starred': 'STARRED',
        'trash': 'TRASH'
      };

      let query = '';
      if (folder === 'starred') {
        query = 'is:starred';
      } else {
        const gmailLabel = folderLabelMap[folder];
        if (gmailLabel) {
          query = `label:${gmailLabel}`;
        }
      }

      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 100,
        q: query
      });

      if (!response.result?.messages) {
        return [];
      }

      // Get full message details for each message
      const messages = await Promise.all(
        response.result.messages.map(async (msg) => {
          const fullMessage = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'full'
          });
          return convertGmailMessage(fullMessage.result);
        })
      );

      return messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error("Error fetching emails by folder:", error);
      toast.error(`Failed to fetch ${folder} emails from Gmail`);
      return [];
    }
  },

async search(query) {
try {
      const gmail = await ensureGmailAuth();
      const searchTerm = query.trim();
      
      if (!searchTerm) {
        return this.getAll();
      }

      // Use Gmail's powerful search syntax
      const gmailQuery = `{${searchTerm}} OR from:${searchTerm} OR subject:${searchTerm}`;
      
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 100,
        q: gmailQuery
      });

      if (!response.result?.messages) {
        return [];
      }

      // Get full message details for each message
      const messages = await Promise.all(
        response.result.messages.map(async (msg) => {
          const fullMessage = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'full'
          });
          return convertGmailMessage(fullMessage.result);
        })
      );

      return messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error("Error searching emails:", error);
      toast.error("Failed to search emails in Gmail");
      return [];
    }
  },

async create(emailData) {
    try {
      const gmail = await ensureGmailAuth();
      
      // Create RFC 2822 formatted email
      const rfcEmail = createRFC2822Email(emailData);
      
      const response = await gmail.users.messages.send({
        userId: 'me',
        resource: {
          raw: rfcEmail
        }
      });

      if (!response.result?.id) {
        throw new Error("Failed to send email");
      }

      // Get the sent message details
      const sentMessage = await gmail.users.messages.get({
        userId: 'me',
        id: response.result.id,
        format: 'full'
      });

      this.notifyChange();
      toast.success("Email sent successfully!");
      
      return convertGmailMessage(sentMessage.result);
    } catch (error) {
      console.error("Error creating email:", error);
      toast.error("Failed to send email via Gmail");
      throw error;
    }
  },

async update(id, updates) {
    try {
      const gmail = await ensureGmailAuth();
      
      // Get the current email first
      const email = await this.getById(id);
      if (!email?.gmailId) {
        throw new Error("Gmail email not found");
      }

      const labelsToAdd = [];
      const labelsToRemove = [];

      // Handle read/unread status
      if (updates.hasOwnProperty('isRead')) {
        if (updates.isRead) {
          labelsToRemove.push('UNREAD');
        } else {
          labelsToAdd.push('UNREAD');
        }
      }

      // Handle starred status
      if (updates.hasOwnProperty('isStarred')) {
        if (updates.isStarred) {
          labelsToAdd.push('STARRED');
        } else {
          labelsToRemove.push('STARRED');
        }
      }

      // Handle folder changes (move between labels)
      if (updates.hasOwnProperty('folder')) {
        const folderLabelMap = {
          'inbox': 'INBOX',
          'sent': 'SENT',
          'drafts': 'DRAFT',
          'starred': 'STARRED',
          'trash': 'TRASH'
        };

        // Remove current folder labels and add new one
        const currentFolder = folderLabelMap[email.folder];
        const newFolder = folderLabelMap[updates.folder];

        if (currentFolder && currentFolder !== newFolder) {
          labelsToRemove.push(currentFolder);
        }
        if (newFolder) {
          labelsToAdd.push(newFolder);
        }
      }

      // Apply label changes
      if (labelsToAdd.length > 0 || labelsToRemove.length > 0) {
        await gmail.users.messages.modify({
          userId: 'me',
          id: email.gmailId,
          resource: {
            addLabelIds: labelsToAdd,
            removeLabelIds: labelsToRemove
          }
        });
      }

      this.notifyChange();
      
      // Return updated email
      return this.getById(id);
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error("Failed to update email in Gmail");
      throw error;
    }
  },

async delete(id) {
    try {
const gmail = await ensureGmailAuth();
      // Get the current email to check its current state
      const email = await this.getById(id);
      
      if (!email?.gmailId) {
        throw new Error("Gmail email not found");
      }

      if (email.folder === "trash") {
        // Permanently delete from Gmail
        await gmail.users.messages.delete({
          userId: 'me',
          id: email.gmailId
        });
        
        this.notifyChange();
        toast.success("Email permanently deleted");
        return { success: true, message: "Email permanently deleted" };
      } else {
        // Move to trash (add TRASH label)
        await gmail.users.messages.modify({
          userId: 'me',
          id: email.gmailId,
          resource: {
            addLabelIds: ['TRASH'],
            removeLabelIds: ['INBOX', 'SENT', 'DRAFT']
          }
        });
        
        this.notifyChange();
        return this.getById(id);
      }
    } catch (error) {
      console.error("Error deleting email:", error);
      toast.error("Failed to delete email in Gmail");
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
      const gmail = await ensureGmailAuth();
      
      // Check for existing draft with same subject
      const existingDrafts = await this.getByFolder("drafts");
      const existingDraft = existingDrafts.find(email => 
        email.subject === draftData.subject && draftData.subject.trim() !== ""
      );

      const rfcEmail = createRFC2822Email(draftData);

      if (existingDraft?.gmailId) {
        // Update existing draft
        const response = await gmail.users.drafts.update({
          userId: 'me',
          id: existingDraft.gmailId,
          resource: {
            message: {
              raw: rfcEmail
            }
          }
        });

        this.notifyChange();
        return this.getById(existingDraft.Id);
      } else {
        // Create new draft
        const response = await gmail.users.drafts.create({
          userId: 'me',
          resource: {
            message: {
              raw: rfcEmail
            }
          }
        });

        this.notifyChange();
        
        // Get the created draft details
        if (response.result?.message?.id) {
          const draftMessage = await gmail.users.messages.get({
            userId: 'me',
            id: response.result.message.id,
            format: 'full'
          });
          
          return convertGmailMessage(draftMessage.result);
        }
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft in Gmail");
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