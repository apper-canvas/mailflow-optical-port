import React, { useState } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "@/index.css";
import Sidebar from "@/components/organisms/Sidebar";
import EmailViewPage from "@/components/pages/EmailViewPage";
import EmailListPage from "@/components/pages/EmailListPage";
import ComposePage from "@/components/pages/ComposePage";

const EmailApp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Router>
<div className="h-screen bg-background overflow-hidden">
        <div className="flex h-full relative">
<Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
          
          <div className="flex-1 flex flex-col min-w-0 w-full lg:w-auto">
            <div className="flex-1 flex flex-col overflow-hidden">
              <Routes>
                <Route 
                  path="/" 
                  element={<Navigate to="/folder/inbox" replace />} 
                />
                <Route 
                  path="/folder/:folder" 
                  element={<EmailListPage onMenuClick={handleMenuClick} />} 
                />
                <Route 
                  path="/compose" 
                  element={<ComposePage />} 
                />
                <Route 
                  path="/compose/draft/:draftId" 
                  element={<ComposePage />} 
                />
                <Route 
                  path="/email/:emailId" 
                  element={<EmailViewPage />} 
                />
                <Route 
                  path="*" 
                  element={<Navigate to="/folder/inbox" replace />} 
                />
              </Routes>
            </div>
          </div>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
};

export default EmailApp;