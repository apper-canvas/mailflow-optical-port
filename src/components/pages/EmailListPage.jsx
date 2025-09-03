import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/organisms/Header";
import EmailList from "@/components/organisms/EmailList";

const EmailListPage = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { folder = "inbox" } = useParams();

  const getFolderTitle = () => {
    const titles = {
      inbox: "Inbox",
      sent: "Sent Mail", 
      drafts: "Drafts",
      starred: "Starred",
      trash: "Trash"
    };
    return titles[folder] || "Emails";
  };

  return (
<div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        onMenuClick={onMenuClick}
        onSearch={setSearchQuery}
        title={getFolderTitle()}
      />
<div className="flex-1 overflow-hidden">
        <EmailList searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default EmailListPage;