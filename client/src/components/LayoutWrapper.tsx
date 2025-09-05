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
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 flex flex-col">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        toggleSidebarCollapse={toggleSidebarCollapse}
        activeHref={activeHref}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black transition-all duration-300 ${
        sidebarCollapsed ? 'md:ml-20' : 'md:ml-72'
      }`}>
        <TopBar 
          toggleSidebar={toggleSidebar}
          title={title || ""}
          subtitle={subtitle}
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebarCollapse={toggleSidebarCollapse}
        />
        
        {/* Page Content */}
        <div className="flex-1 container mx-auto px-4 py-8 text-gray-900 dark:text-white">
          {children}
        </div>
        
        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="mb-2 sm:mb-0">
                © 2024 Algı Akademi. Tüm hakları saklıdır.
              </div>
              <div className="flex items-center space-x-2">
                <span>Design by</span>
                <a 
                  href="https://www.3ytasarim.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200 hover:underline"
                >
                  3Y Tasarım Yazılım Hizmetleri
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}