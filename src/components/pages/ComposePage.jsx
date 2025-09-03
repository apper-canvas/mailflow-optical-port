import React from "react";
import { useLocation } from "react-router-dom";
import EmailComposer from "@/components/organisms/EmailComposer";

const ComposePage = () => {
  const location = useLocation();
  const { replyTo, forwardEmail } = location.state || {};

  return (
    <div className="flex-1">
      <EmailComposer 
        replyTo={replyTo} 
        forwardEmail={forwardEmail}
      />
    </div>
  );
};

export default ComposePage;