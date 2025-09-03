import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import emailService from "@/services/api/emailService";
import { cn } from "@/utils/cn";

const EmailComposer = ({ replyTo, forwardEmail, onClose }) => {
  const [formData, setFormData] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: ""
  });
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const { draftId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (replyTo) {
      setFormData({
        to: replyTo.from,
        cc: "",
        bcc: "",
        subject: replyTo.subject.startsWith("Re:") ? replyTo.subject : `Re: ${replyTo.subject}`,
        body: `\n\n--- Original Message ---\nFrom: ${replyTo.fromName} <${replyTo.from}>\nDate: ${new Date(replyTo.timestamp).toLocaleString()}\nSubject: ${replyTo.subject}\n\n${replyTo.body}`
      });
    } else if (forwardEmail) {
      setFormData({
        to: "",
        cc: "",
        bcc: "",
        subject: forwardEmail.subject.startsWith("Fwd:") ? forwardEmail.subject : `Fwd: ${forwardEmail.subject}`,
        body: `\n\n--- Forwarded Message ---\nFrom: ${forwardEmail.fromName} <${forwardEmail.from}>\nDate: ${new Date(forwardEmail.timestamp).toLocaleString()}\nSubject: ${forwardEmail.subject}\n\n${forwardEmail.body}`
      });
    } else if (draftId) {
      loadDraft();
    }
  }, [replyTo, forwardEmail, draftId]);

  const loadDraft = async () => {
    try {
      const draft = await emailService.getById(draftId);
      setFormData({
        to: Array.isArray(draft.to) ? draft.to.join(", ") : draft.to,
        cc: Array.isArray(draft.cc) ? draft.cc.join(", ") : draft.cc || "",
        bcc: Array.isArray(draft.bcc) ? draft.bcc.join(", ") : draft.bcc || "",
        subject: draft.subject,
        body: draft.body
      });
      if (draft.cc) setShowCc(true);
      if (draft.bcc) setShowBcc(true);
    } catch (err) {
      toast.error("Failed to load draft");
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const parseEmails = (emailString) => {
    if (!emailString) return [];
    return emailString.split(",").map(email => email.trim()).filter(Boolean);
  };

  const handleSend = async () => {
    if (!formData.to.trim()) {
      toast.error("Please add at least one recipient");
      return;
    }

    setSending(true);
    try {
      await emailService.create({
        to: parseEmails(formData.to),
        cc: parseEmails(formData.cc),
        bcc: parseEmails(formData.bcc),
        subject: formData.subject,
        body: formData.body,
        folder: "sent"
      });

      // Delete draft if editing one
      if (draftId) {
        try {
          await emailService.delete(draftId);
        } catch (err) {
          console.error("Failed to delete draft:", err);
        }
      }

      toast.success("Email sent successfully!");
      navigate("/folder/sent");
      onClose?.();
    } catch (err) {
      toast.error("Failed to send email");
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await emailService.saveDraft({
        to: parseEmails(formData.to),
        cc: parseEmails(formData.cc),
        bcc: parseEmails(formData.bcc),
        subject: formData.subject,
        body: formData.body
      });
      toast.success("Draft saved");
    } catch (err) {
      toast.error("Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (window.confirm("Are you sure you want to discard this email?")) {
      navigate(-1);
      onClose?.();
    }
  };

  return (
    <div className="bg-white h-full flex flex-col">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ApperIcon name="PenSquare" className="text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">
              {replyTo ? "Reply" : forwardEmail ? "Forward" : draftId ? "Edit Draft" : "New Message"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon="Save"
              onClick={handleSaveDraft}
              loading={saving}
            >
              Save Draft
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon="X"
              onClick={handleDiscard}
            >
              Discard
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 space-y-4 border-b border-gray-200">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 w-12">To:</label>
              <Input
                value={formData.to}
                onChange={(e) => handleChange("to", e.target.value)}
                placeholder="Recipients"
                className="flex-1"
              />
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCc(!showCc)}
                  className={cn("text-xs", showCc && "text-primary")}
                >
                  Cc
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBcc(!showBcc)}
                  className={cn("text-xs", showBcc && "text-primary")}
                >
                  Bcc
                </Button>
              </div>
            </div>

            {showCc && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 w-12">Cc:</label>
                <Input
                  value={formData.cc}
                  onChange={(e) => handleChange("cc", e.target.value)}
                  placeholder="Carbon copy"
                  className="flex-1"
                />
              </div>
            )}

            {showBcc && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 w-12">Bcc:</label>
                <Input
                  value={formData.bcc}
                  onChange={(e) => handleChange("bcc", e.target.value)}
                  placeholder="Blind carbon copy"
                  className="flex-1"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 w-12">Subject:</label>
              <Input
                value={formData.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                placeholder="Subject"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 p-4">
          <textarea
            value={formData.body}
            onChange={(e) => handleChange("body", e.target.value)}
            placeholder="Write your message..."
            className="w-full h-full resize-none border-none outline-none text-sm leading-relaxed email-editor"
          />
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSend}
                loading={sending}
                icon="Send"
                disabled={!formData.to.trim()}
              >
                Send
              </Button>
              <Button
                variant="secondary"
                icon="Paperclip"
                disabled
                className="opacity-50"
              >
                Attach
              </Button>
            </div>
            <Button
              variant="ghost"
              icon="Trash2"
              onClick={handleDiscard}
              className="text-red-500 hover:text-red-600"
            >
              Discard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailComposer;