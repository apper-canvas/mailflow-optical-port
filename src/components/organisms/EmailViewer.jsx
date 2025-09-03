import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import emailService from "@/services/api/emailService";
import ApperIcon from "@/components/ApperIcon";
import EmailActions from "@/components/molecules/EmailActions";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";

const EmailViewer = () => {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { emailId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (emailId) {
      loadEmail();
    }
  }, [emailId]);

  const loadEmail = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await emailService.getById(emailId);
      setEmail(data);
      
      // Mark as read if not already
      if (!data.isRead) {
        await emailService.markAsRead(emailId);
        setEmail(prev => ({ ...prev, isRead: true }));
      }
    } catch (err) {
      setError(err.message || "Failed to load email");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = () => {
    navigate("/compose", { state: { replyTo: email } });
  };

  const handleForward = () => {
    navigate("/compose", { state: { forwardEmail: email } });
  };

const handleDelete = async () => {
    try {
      await emailService.delete(email.id);
      toast.success("Email moved to trash");
      navigate(-1);
    } catch (error) {
      console.error("Failed to delete email:", error);
      const errorMessage = error?.response?.data?.message || error.message || "Failed to delete email";
      toast.error(errorMessage);
    }
  };

const handleToggleStar = async () => {
    try {
      const updatedEmail = await emailService.toggleStar(email.id);
      setEmail(updatedEmail);
      toast.success(updatedEmail.isStarred ? "Email starred" : "Email unstarred");
    } catch (error) {
      console.error("Failed to toggle star:", error);
      const errorMessage = error?.response?.data?.message || error.message || "Failed to update email";
      toast.error(errorMessage);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatEmailBody = (body) => {
    return body.split("\n").map((line, index) => (
      <p key={index} className="mb-2">
        {line || <br />}
      </p>
    ));
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true });
      } else {
        return format(date, "MMM d, yyyy 'at' h:mm a");
      }
    } catch {
      return "Unknown time";
    }
  };

  if (loading) {
    return <Loading type="email-content" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadEmail} />;
  }

  if (!email) {
    return <Error message="Email not found" />;
  }

  return (
<div className="bg-white h-full flex flex-col overflow-hidden border border-gray-200">
<div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            icon="ArrowLeft"
            onClick={handleBack}
          >
            Back
          </Button>
          <EmailActions
            email={email}
            onReply={handleReply}
            onForward={handleForward}
            onDelete={handleDelete}
            onToggleStar={handleToggleStar}
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-4">
<Avatar name={email.fromName} email={email.from} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
<h3 className="font-semibold text-gray-900">
                    {email.fromName || email.from}
                  </h3>
<p className="text-sm text-gray-700">{email.from}</p>
                </div>
                <div className="text-right">
<p className="text-sm text-gray-600">
                    {formatTimestamp(email.timestamp)}
                  </p>
                  {email.isStarred && (
                    <ApperIcon name="Star" size={16} className="text-yellow-500 fill-current ml-auto mt-1" />
                  )}
                </div>
              </div>
              
<div className="mt-2 text-sm text-gray-700">
                <div className="mb-1">
                  <strong>To:</strong>
                  <div className="mt-1 space-y-1">
                    {Array.isArray(email.to) ? (
                      email.to.map((recipient, index) => (
                        <div key={index} className="flex items-center gap-2 ml-4">
                          <Avatar name={recipient} email={recipient} size="sm" />
                          <span className="text-gray-700">{recipient}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 ml-4">
                        <Avatar name={email.to} email={email.to} size="sm" />
                        <span className="text-gray-700">{email.to}</span>
                      </div>
                    )}
                  </div>
                </div>
                {email.cc && email.cc.length > 0 && (
                  <p><strong>Cc:</strong> {Array.isArray(email.cc) ? email.cc.join(", ") : email.cc}</p>
                )}
              </div>
            </div>
          </div>
          
          <div>
<h1 className="text-xl font-semibold text-gray-900 mb-1">
              {email.subject || "(No subject)"}
            </h1>
          </div>
        </div>
      </div>

<div className="flex-1 p-4 sm:p-6 overflow-auto custom-scrollbar bg-white">
        <div className="prose prose-sm max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {formatEmailBody(email.body)}
          </div>
        </div>
        
        {email.hasAttachments && (
<div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ApperIcon name="Paperclip" size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Attachments</span>
            </div>
<div className="text-sm text-gray-600">
              Attachment functionality would be implemented here
            </div>
          </div>
        )}
      </div>

<div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-2">
          <Button onClick={handleReply} icon="Reply">
            Reply
          </Button>
          <Button variant="secondary" onClick={handleForward} icon="Forward">
            Forward
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailViewer;