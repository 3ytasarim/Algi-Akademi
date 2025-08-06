import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useTheme } from "@/contexts/ThemeContext";

interface LayoutWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  activeHref?: string;
}

export default function LayoutWrapper({ children, title, subtitle, activeHref }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme } = useTheme();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleSidebarCollapse = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        toggleSidebarCollapse={toggleSidebarCollapse}
        activeHref={activeHref}
      />

      {/* Main Content */}
      <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black transition-all duration-300 ${
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
        <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-white">
          {children}
        </div>
      </div>
    </div>
  );
}