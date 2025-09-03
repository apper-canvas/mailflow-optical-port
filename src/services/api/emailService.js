import { toast } from "react-toastify";

// Callback system for notifying components of data changes
let changeCallbacks = [];

// Helper to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock email data storage (in memory)
let mockEmails = [
  {
    Id: 1,
    from: "sarah.johnson@company.com",
    fromName: "Sarah Johnson",
    to: ["user@mailflow.com"],
    cc: [],
    bcc: [],
    subject: "Q4 Marketing Campaign Results",
    body: "Hi there,\n\nI wanted to share the fantastic results from our Q4 marketing campaign. We exceeded our targets by 23% and generated significant brand awareness across all channels.\n\nKey highlights:\n• Social media engagement up 45%\n• Email open rates improved to 28%\n• Lead generation increased by 67%\n\nI'll send the detailed report by tomorrow. Great work everyone!\n\nBest regards,\nSarah",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    isStarred: true,
    folder: "inbox",
    threadId: "thread_1",
    hasAttachments: true
  },
  {
    Id: 2,
    from: "mike.chen@techcorp.com",
    fromName: "Mike Chen",
    to: ["user@mailflow.com"],
    cc: ["team@mailflow.com"],
    bcc: [],
    subject: "Project Alpha - Phase 2 Complete",
    body: "Team,\n\nGreat news! We've successfully completed Phase 2 of Project Alpha ahead of schedule. The implementation went smoothly and all tests passed.\n\nNext steps:\n1. Deploy to staging environment\n2. Conduct user acceptance testing\n3. Prepare for production rollout next week\n\nThanks for everyone's hard work on this milestone.\n\nBest,\nMike",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    isStarred: false,
    folder: "inbox",
    threadId: "thread_2",
    hasAttachments: false
  },
  {
    Id: 3,
    from: "jessica.williams@design.com",
    fromName: "Jessica Williams",
    to: ["user@mailflow.com"],
    cc: [],
    bcc: [],
    subject: "New Brand Guidelines Ready for Review",
    body: "Hi,\n\nI've completed the updated brand guidelines document. Please review the attached PDF and let me know if you have any feedback.\n\nThe main changes include:\n- Updated color palette\n- New typography standards\n- Revised logo usage guidelines\n- Social media templates\n\nDeadline for feedback is Friday. Thanks!\n\nJessica",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    isStarred: false,
    folder: "inbox",
    threadId: "thread_3",
    hasAttachments: true
  },
  {
    Id: 4,
    from: "david.taylor@supplier.com",
    fromName: "David Taylor",
    to: ["user@mailflow.com"],
    cc: [],
    bcc: [],
    subject: "Invoice #2024-0156 - Payment Confirmation",
    body: "Dear Customer,\n\nThank you for your payment of $2,450.00 for Invoice #2024-0156. We have received and processed your payment successfully.\n\nPayment details:\n- Amount: $2,450.00\n- Payment method: Bank transfer\n- Transaction ID: TXN-789456123\n- Date processed: Today\n\nYour account is now up to date. If you have any questions, please don't hesitate to contact us.\n\nBest regards,\nDavid Taylor\nAccounts Receivable",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    isStarred: false,
    folder: "inbox",
    threadId: "thread_4",
    hasAttachments: false
  },
  {
    Id: 5,
    from: "user@mailflow.com",
    fromName: "You",
    to: ["client@example.com"],
    cc: [],
    bcc: [],
    subject: "Meeting Follow-up - Action Items",
    body: "Hi,\n\nThank you for the productive meeting today. As discussed, here are the key action items:\n\n1. Review the proposal by Friday\n2. Schedule follow-up meeting for next week\n3. Share technical requirements document\n4. Coordinate with the development team\n\nI'll send the meeting notes separately. Looking forward to moving forward with this project.\n\nBest regards",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    isStarred: false,
    folder: "sent",
    threadId: "thread_5",
    hasAttachments: false
  },
  {
    Id: 6,
    from: "newsletter@techweekly.com",
    fromName: "Tech Weekly",
    to: ["user@mailflow.com"],
    cc: [],
    bcc: [],
    subject: "This Week in Tech: AI Breakthroughs and Industry News",
    body: "Weekly Tech Digest - December Edition\n\nTop Stories This Week:\n\n🚀 AI Revolution Continues\nBreakthrough in natural language processing leads to more human-like interactions\n\n💻 Cloud Computing Trends\nEdge computing adoption accelerates across industries\n\n🔒 Cybersecurity Updates\nNew security protocols announced for better data protection\n\n📱 Mobile Innovation\nLatest smartphone features focus on productivity and health\n\nStay informed with the latest tech trends. Read more at techweekly.com\n\nUnsubscribe | Update preferences",
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    isStarred: false,
    folder: "inbox",
    threadId: "thread_6",
    hasAttachments: false
  },
  {
    Id: 7,
    from: "emma.davis@marketing.com",
    fromName: "Emma Davis",
    to: ["user@mailflow.com"],
    cc: ["manager@mailflow.com"],
    bcc: [],
    subject: "Website Analytics Report - November",
    body: "Hi Team,\n\nHere's the November website analytics report:\n\n📊 Key Metrics:\n• Unique visitors: 45,231 (+12% from October)\n• Page views: 128,567 (+8% from October)\n• Bounce rate: 34.2% (-2.1% improvement)\n• Average session duration: 3:42 minutes\n• Top performing pages: Product pages, Blog posts\n\n🎯 Insights:\n- Mobile traffic continues to dominate (68%)\n- Organic search remains our top traffic source\n- Conversion rate improved by 1.3%\n\nFull report attached. Let's discuss optimization strategies in our next meeting.\n\nBest,\nEmma",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    isStarred: true,
    folder: "inbox",
    threadId: "thread_7",
    hasAttachments: true
  },
  {
    Id: 8,
    from: "support@cloudservice.com",
    fromName: "Cloud Service Support",
    to: ["user@mailflow.com"],
    cc: [],
    bcc: [],
    subject: "Scheduled Maintenance Complete - All Systems Operational",
    body: "Dear Valued Customer,\n\nWe're pleased to inform you that our scheduled maintenance has been completed successfully. All systems are now fully operational.\n\nMaintenance Summary:\n⏱️ Duration: 2 hours (2:00 AM - 4:00 AM EST)\n✅ Status: Completed successfully\n🔧 Updates: Security patches, performance improvements\n📊 Impact: No data loss, improved performance\n\nWhat's New:\n• Enhanced security protocols\n• 15% faster response times\n• Improved reliability\n• New backup procedures\n\nThank you for your patience during the maintenance window.\n\nBest regards,\nCloud Service Team",
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    isStarred: false,
    folder: "inbox",
    threadId: "thread_8",
    hasAttachments: false
  },
  {
    Id: 9,
    from: "user@mailflow.com",
    fromName: "You",
    to: ["team@company.com"],
    cc: [],
    bcc: [],
    subject: "Draft: Quarterly Team Update",
    body: "Team,\n\nI wanted to provide an update on our quarterly progress...\n\n[This is a draft email - still working on the content]\n\nKey achievements:\n- \n- \n- \n\nUpcoming priorities:\n- \n- \n- \n\nWill finalize and send soon.\n\nBest regards",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    isStarred: false,
    folder: "drafts",
    threadId: "thread_9",
    hasAttachments: false
  },
  {
    Id: 10,
    from: "alex.brown@consulting.com",
    fromName: "Alex Brown",
    to: ["user@mailflow.com"],
    cc: [],
    bcc: [],
    subject: "Strategy Review Meeting - Rescheduled",
    body: "Hi,\n\nI need to reschedule our strategy review meeting originally planned for Thursday.\n\nProposed new times:\n• Friday 2:00 PM - 3:30 PM\n• Monday 10:00 AM - 11:30 AM\n• Tuesday 3:00 PM - 4:30 PM\n\nPlease let me know which time works best for you. I apologize for the inconvenience.\n\nThe agenda remains the same:\n1. Q4 performance review\n2. 2024 strategic planning\n3. Resource allocation discussion\n4. Timeline and milestones\n\nLooking forward to our discussion.\n\nBest regards,\nAlex",
    timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    isStarred: false,
    folder: "inbox",
    threadId: "thread_10",
    hasAttachments: false
  },
  {
    Id: 11,
    from: "spam@promotions.com",
    fromName: "Special Offers",
    to: ["user@mailflow.com"],
    cc: [],
    bcc: [],
    subject: "🎉 Limited Time Offer - 50% Off Everything!",
    body: "🔥 AMAZING DEAL ALERT! 🔥\n\nDon't miss out on our biggest sale of the year!\n\n✨ 50% OFF EVERYTHING\n✨ FREE SHIPPING WORLDWIDE\n✨ 24 HOURS ONLY!\n\nShop now or regret later! This incredible offer expires at midnight!\n\n👇 CLICK HERE TO SHOP NOW 👇\n[Shop Now Button]\n\nTerms and conditions apply. Limited time only.",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    isStarred: false,
    folder: "trash",
    threadId: "thread_11",
    hasAttachments: false
  },
  {
    Id: 12,
    from: "linda.garcia@hr.com",
    fromName: "Linda Garcia",
    to: ["user@mailflow.com"],
    cc: [],
    bcc: [],
    subject: "Employee Benefits Enrollment - Deadline Reminder",
    body: "Dear Team Member,\n\nThis is a friendly reminder that the deadline for employee benefits enrollment is approaching.\n\n🗓️ Important Dates:\n• Enrollment deadline: December 15, 2024\n• Coverage begins: January 1, 2025\n• No changes allowed after deadline\n\n📋 Available Benefits:\n✅ Health Insurance (Multiple plans)\n✅ Dental Coverage\n✅ Vision Insurance\n✅ Life Insurance\n✅ Disability Insurance\n✅ 401(k) Retirement Plan\n✅ Flexible Spending Account\n\nTo enroll or make changes:\n1. Log into the employee portal\n2. Complete the benefits selection form\n3. Submit by the deadline\n\nIf you need assistance, please contact HR at extension 1234.\n\nBest regards,\nLinda Garcia\nHuman Resources",
    timestamp: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    isStarred: true,
    folder: "inbox",
    threadId: "thread_12",
    hasAttachments: false
  },
  {
    Id: 13,
    from: "carlos.rodriguez@finance.com",
    fromName: "Carlos Rodriguez",
    to: ["user@mailflow.com"],
    cc: ["accounting@mailflow.com"],
    bcc: [],
    subject: "Budget Approval Request - Project Delta",
    body: "Hello,\n\nI'm submitting a budget approval request for Project Delta as discussed in our last meeting.\n\n💰 Budget Breakdown:\n• Development costs: $45,000\n• Marketing expenses: $15,000\n• Equipment purchases: $8,000\n• Training and certification: $5,000\n• Contingency (10%): $7,300\n• Total requested: $80,300\n\n📅 Timeline:\n• Project start: January 2025\n• Expected completion: June 2025\n• ROI projection: 185% within 18 months\n\nDetailed proposal and financial projections are attached. Please review and let me know if you need additional information.\n\nThank you for your consideration.\n\nBest regards,\nCarlos Rodriguez\nFinance Manager",
    timestamp: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    isStarred: false,
    folder: "inbox",
    threadId: "thread_13",
    hasAttachments: true
  },
  {
    Id: 14,
    from: "security@company.com",
    fromName: "IT Security Team",
    to: ["user@mailflow.com"],
    cc: [],
    bcc: [],
    subject: "🔒 Security Alert: Password Policy Update Required",
    body: "SECURITY NOTICE - Action Required\n\nDear Team Member,\n\nAs part of our ongoing security improvements, we are implementing enhanced password policies effective immediately.\n\n🔐 New Password Requirements:\n• Minimum 12 characters (previously 8)\n• Must include uppercase, lowercase, numbers, and symbols\n• Cannot reuse last 5 passwords\n• Must be changed every 90 days\n• Two-factor authentication mandatory\n\n⚠️ Action Required:\n1. Update your password by December 20, 2024\n2. Enable 2FA on all accounts\n3. Complete security awareness training\n\n🛡️ Why This Matters:\n• Recent increase in cyber threats\n• Protection of sensitive company data\n• Compliance with industry standards\n• Safeguarding client information\n\nLogin to the security portal to update your credentials: security.company.com\n\nQuestions? Contact IT Security at security@company.com\n\nBest regards,\nIT Security Team",
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    isStarred: true,
    folder: "inbox",
    threadId: "thread_14",
    hasAttachments: false
  },
  {
    Id: 15,
    from: "user@mailflow.com",
    fromName: "You",
    to: ["sarah.johnson@company.com"],
    cc: [],
    bcc: [],
    subject: "Re: Q4 Marketing Campaign Results",
    body: "Hi Sarah,\n\nThank you for sharing these excellent results! The numbers are truly impressive and reflect the hard work everyone put into the campaign.\n\nI'm particularly excited about:\n• The 45% increase in social media engagement\n• The significant improvement in lead generation\n• The overall 23% target exceeded\n\nI'd love to schedule a meeting next week to discuss:\n1. What strategies worked best\n2. How we can replicate this success in Q1\n3. Budget allocation for the next campaign\n4. Team recognition for outstanding performance\n\nAre you available Tuesday or Wednesday afternoon?\n\nLooking forward to the detailed report and continuing this momentum!\n\nBest regards",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    isStarred: false,
    folder: "sent",
    threadId: "thread_1",
    hasAttachments: false
  }
];

// Generate unique ID for new emails
let nextEmailId = 16;

const emailService = {
  async getAll() {
    try {
      await delay(300); // Simulate API delay
      return [...mockEmails].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast.error("Failed to fetch emails");
      return [];
    }
  },

  async getById(id) {
    try {
      await delay(200);
      const email = mockEmails.find(email => email.Id === parseInt(id));
      if (!email) {
        throw new Error("Email not found");
      }
      return { ...email };
    } catch (error) {
      console.error(`Error fetching email ${id}:`, error);
      throw new Error("Email not found");
    }
  },

  async getByFolder(folder) {
    try {
      await delay(250);
      let filteredEmails = [];
      
      if (folder === 'starred') {
        filteredEmails = mockEmails.filter(email => email.isStarred && email.folder !== 'trash');
      } else {
        filteredEmails = mockEmails.filter(email => email.folder === folder);
      }
      
      return filteredEmails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error("Error fetching emails by folder:", error);
      toast.error(`Failed to fetch ${folder} emails`);
      return [];
    }
  },

  async search(query) {
    try {
      await delay(300);
      const searchTerm = query.trim().toLowerCase();
      
      if (!searchTerm) {
        return this.getAll();
      }

      const filteredEmails = mockEmails.filter(email => 
        email.subject.toLowerCase().includes(searchTerm) ||
        email.body.toLowerCase().includes(searchTerm) ||
        email.from.toLowerCase().includes(searchTerm) ||
        email.fromName.toLowerCase().includes(searchTerm) ||
        (Array.isArray(email.to) ? email.to.some(recipient => recipient.toLowerCase().includes(searchTerm)) : email.to.toLowerCase().includes(searchTerm))
      );

      return filteredEmails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error("Error searching emails:", error);
      toast.error("Failed to search emails");
      return [];
    }
  },

  async create(emailData) {
    try {
      await delay(400);
      
      const newEmail = {
        Id: nextEmailId++,
        from: "user@mailflow.com",
        fromName: "You",
        to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
        cc: emailData.cc || [],
        bcc: emailData.bcc || [],
        subject: emailData.subject || "(No Subject)",
        body: emailData.body || "",
        timestamp: new Date().toISOString(),
        isRead: true,
        isStarred: false,
        folder: "sent",
        threadId: `thread_${nextEmailId}`,
        hasAttachments: false
      };

      mockEmails.push(newEmail);
      this.notifyChange();
      toast.success("Email sent successfully!");
      
      return { ...newEmail };
    } catch (error) {
      console.error("Error creating email:", error);
      toast.error("Failed to send email");
      throw error;
    }
  },

  async update(id, updates) {
    try {
      await delay(200);
      
      const emailIndex = mockEmails.findIndex(email => email.Id === parseInt(id));
      if (emailIndex === -1) {
        throw new Error("Email not found");
      }

      mockEmails[emailIndex] = { ...mockEmails[emailIndex], ...updates };
      
      this.notifyChange();
      return { ...mockEmails[emailIndex] };
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error("Failed to update email");
      throw error;
    }
  },

  async delete(id) {
    try {
      await delay(250);
      
      const emailIndex = mockEmails.findIndex(email => email.Id === parseInt(id));
      if (emailIndex === -1) {
        throw new Error("Email not found");
      }

      const email = mockEmails[emailIndex];
      
      if (email.folder === "trash") {
        // Permanently delete
        mockEmails.splice(emailIndex, 1);
        this.notifyChange();
        toast.success("Email permanently deleted");
        return { success: true, message: "Email permanently deleted" };
      } else {
        // Move to trash
        mockEmails[emailIndex].folder = "trash";
        this.notifyChange();
        toast.success("Email moved to trash");
        return { ...mockEmails[emailIndex] };
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
      await delay(300);
      
      // Check for existing draft with same subject
      const existingDraftIndex = mockEmails.findIndex(email => 
        email.folder === "drafts" && 
        email.subject === draftData.subject && 
        draftData.subject.trim() !== ""
      );

      if (existingDraftIndex !== -1) {
        // Update existing draft
        mockEmails[existingDraftIndex] = {
          ...mockEmails[existingDraftIndex],
          to: Array.isArray(draftData.to) ? draftData.to : [draftData.to],
          cc: draftData.cc || [],
          bcc: draftData.bcc || [],
          subject: draftData.subject || "(No Subject)",
          body: draftData.body || "",
          timestamp: new Date().toISOString()
        };
        
        this.notifyChange();
        toast.success("Draft updated");
        return { ...mockEmails[existingDraftIndex] };
      } else {
        // Create new draft
        const newDraft = {
          Id: nextEmailId++,
          from: "user@mailflow.com",
          fromName: "You",
          to: Array.isArray(draftData.to) ? draftData.to : [draftData.to],
          cc: draftData.cc || [],
          bcc: draftData.bcc || [],
          subject: draftData.subject || "(No Subject)",
          body: draftData.body || "",
          timestamp: new Date().toISOString(),
          isRead: true,
          isStarred: false,
          folder: "drafts",
          threadId: `thread_${nextEmailId}`,
          hasAttachments: false
        };

        mockEmails.push(newDraft);
        this.notifyChange();
        toast.success("Draft saved");
        return { ...newDraft };
      }
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