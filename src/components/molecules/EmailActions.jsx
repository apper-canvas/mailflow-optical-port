import React from "react";
import Button from "@/components/atoms/Button";

const EmailActions = ({ 
  email, 
  onReply, 
  onForward, 
  onDelete, 
  onToggleStar,
  onMarkAsRead,
  compact = false 
}) => {
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          icon={email?.isStarred ? "Star" : "StarOff"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar?.(email?.Id);
          }}
          className={email?.isStarred ? "text-yellow-500 hover:text-yellow-600" : ""}
        />
        <Button
          variant="ghost"
          size="sm"
          icon="Trash2"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(email?.Id);
          }}
          className="text-red-500 hover:text-red-600"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="secondary"
        size="sm"
        icon="Reply"
        onClick={() => onReply?.(email)}
      >
        Reply
      </Button>
      <Button
        variant="secondary"
        size="sm"
        icon="Forward"
        onClick={() => onForward?.(email)}
      >
        Forward
      </Button>
      <Button
        variant="ghost"
        size="sm"
        icon={email?.isStarred ? "Star" : "StarOff"}
        onClick={() => onToggleStar?.(email?.Id)}
        className={email?.isStarred ? "text-yellow-500 hover:text-yellow-600" : ""}
      >
        {email?.isStarred ? "Unstar" : "Star"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        icon="Trash2"
        onClick={() => onDelete?.(email?.Id)}
        className="text-red-500 hover:text-red-600"
      >
        Delete
      </Button>
      {!email?.isRead && (
        <Button
          variant="ghost"
          size="sm"
          icon="Mail"
          onClick={() => onMarkAsRead?.(email?.Id)}
        >
          Mark as read
        </Button>
      )}
    </div>
  );
};

export default EmailActions;