import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background-dark text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar onMenuToggle={toggleSidebar} />

      <div className="flex flex-1 relative">
        {/* Left Navigation Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main Content Workspace */}
        <main className="flex-1 lg:pl-64 min-h-[calc(100vh-73px)] p-6 transition-all duration-300 bg-background-dark overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
