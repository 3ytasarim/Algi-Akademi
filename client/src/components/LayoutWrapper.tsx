import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface LayoutWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  activeHref?: string;
}

export default function LayoutWrapper({ children, title, subtitle, activeHref }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleSidebarCollapse = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        toggleSidebarCollapse={toggleSidebarCollapse}
        activeHref={activeHref}
      />

      {/* Main Content */}
      <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-white transition-all duration-300 ${
        sidebarCollapsed ? 'md:ml-20' : 'md:ml-72'
      }`}>
        <TopBar 
          toggleSidebar={toggleSidebar}
          title={title}
          subtitle={subtitle}
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebarCollapse={toggleSidebarCollapse}
        />
        
        {/* Page Content */}
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}