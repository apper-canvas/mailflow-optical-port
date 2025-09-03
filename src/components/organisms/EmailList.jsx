import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Avatar from "@/components/atoms/Avatar";
import EmailActions from "@/components/molecules/EmailActions";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import emailService from "@/services/api/emailService";
import { cn } from "@/utils/cn";

const EmailList = ({ searchQuery }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEmails, setSelectedEmails] = useState([]);
  const { folder = "inbox" } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadEmails();
  }, [folder, searchQuery]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      setError("");
      
      let data;
      if (searchQuery?.trim()) {
        data = await emailService.search(searchQuery);
      } else {
        data = await emailService.getByFolder(folder);
      }
      
      setEmails(data);
    } catch (err) {
      setError(err.message || "Failed to load emails");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailClick = async (email) => {
    if (!email.isRead) {
      try {
        await emailService.markAsRead(email.Id);
        setEmails(prev => prev.map(e => 
          e.Id === email.Id ? { ...e, isRead: true } : e
        ));
      } catch (err) {
        console.error("Failed to mark email as read:", err);
      }
    }
    navigate(`/email/${email.Id}`);
  };

  const handleToggleStar = async (emailId) => {
    try {
      const updatedEmail = await emailService.toggleStar(emailId);
      setEmails(prev => prev.map(e => 
        e.Id === emailId ? updatedEmail : e
      ));
      toast.success(updatedEmail.isStarred ? "Email starred" : "Email unstarred");
    } catch (err) {
      toast.error("Failed to update email");
    }
  };

  const handleDelete = async (emailId) => {
    try {
      await emailService.delete(emailId);
      setEmails(prev => prev.filter(e => e.Id !== emailId));
      toast.success("Email moved to trash");
    } catch (err) {
      toast.error("Failed to delete email");
    }
  };

  const handleSelectEmail = (emailId, isSelected) => {
    setSelectedEmails(prev => 
      isSelected 
        ? [...prev, emailId]
        : prev.filter(id => id !== emailId)
    );
  };

  const handleSelectAll = (isSelected) => {
    setSelectedEmails(isSelected ? emails.map(e => e.Id) : []);
  };

  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  const getEmailPreview = (body) => {
    return body.replace(/\n/g, " ").slice(0, 120) + (body.length > 120 ? "..." : "");
  };

  const getFolderTitle = () => {
    const titles = {
      inbox: "Inbox",
      sent: "Sent Mail",
      drafts: "Drafts",
      starred: "Starred",
      trash: "Trash"
    };
    return searchQuery ? `Search results for "${searchQuery}"` : titles[folder] || "Emails";
  };

  if (loading) {
    return <Loading type="email-list" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadEmails} />;
  }

  if (emails.length === 0) {
    const emptyProps = {
      inbox: {
        icon: "Inbox",
        title: "Your inbox is empty",
        description: "No new messages. When you receive emails, they'll appear here.",
      },
      sent: {
        icon: "Send",
        title: "No sent emails",
        description: "Emails you send will appear here.",
        actionLabel: "Compose Email",
        onAction: () => navigate("/compose")
      },
      drafts: {
        icon: "FileText",
        title: "No drafts",
        description: "Your draft emails will be saved here.",
        actionLabel: "Compose Email",
        onAction: () => navigate("/compose")
      },
      starred: {
        icon: "Star",
        title: "No starred emails",
        description: "Star important emails to find them quickly here.",
      },
      trash: {
        icon: "Trash2",
        title: "Trash is empty",
        description: "Deleted emails will appear here.",
      }
    };

    const emptyConfig = searchQuery 
      ? {
          icon: "Search",
          title: "No emails found",
          description: `No emails match your search for "${searchQuery}".`
        }
      : emptyProps[folder] || emptyProps.inbox;

    return <Empty {...emptyConfig} />;
  }

  return (
<div className="bg-white overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedEmails.length === emails.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary/20"
              />
            </label>
            <h2 className="text-lg font-semibold text-gray-900">
              {getFolderTitle()}
            </h2>
            <span className="text-sm text-gray-500">
              {emails.length} email{emails.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 custom-scrollbar" style={{ maxHeight: "calc(100vh - 140px)", overflowY: "auto" }}>
        {emails.map((email) => (
          <div
            key={email.Id}
            className={cn(
              "email-row",
              !email.isRead && "unread",
              selectedEmails.includes(email.Id) && "selected"
            )}
            onClick={() => handleEmailClick(email)}
          >
<div className="p-3 sm:p-4">
              <div className="flex items-start gap-4">
                <label className="flex items-center mt-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedEmails.includes(email.Id)}
                    onChange={(e) => handleSelectEmail(email.Id, e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary/20"
                  />
                </label>

                <Avatar name={email.fromName} email={email.from} size="md" />

                <div className="flex-1 min-w-0">
<div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "font-medium truncate",
                          !email.isRead ? "font-semibold text-gray-900" : "text-gray-700"
                        )}>
                          {email.fromName || email.from}
                        </span>
                        {!email.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                        )}
                        {email.hasAttachments && (
                          <ApperIcon name="Paperclip" size={14} className="text-gray-400 flex-shrink-0" />
                        )}
                        {email.isStarred && (
                          <ApperIcon name="Star" size={14} className="text-yellow-500 fill-current flex-shrink-0" />
                        )}
                      </div>
                      <div className={cn(
                        "text-sm truncate mb-1",
                        !email.isRead ? "font-semibold text-gray-900" : "text-gray-600"
                      )}>
                        {email.subject || "(No subject)"}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {getEmailPreview(email.body)}
                      </div>
                    </div>
                    
<div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <span className="text-sm text-gray-500 hidden sm:block">
                        {formatTimestamp(email.timestamp)}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <EmailActions
                          email={email}
                          onToggleStar={handleToggleStar}
                          onDelete={handleDelete}
                          compact
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmailList;