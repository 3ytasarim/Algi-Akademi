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
        <footer className="border-t border-gray-200/30 dark:border-gray-700/30 bg-gradient-to-r from-gray-50/80 via-white/60 to-gray-50/80 dark:from-gray-900/80 dark:via-gray-800/60 dark:to-gray-900/80 backdrop-blur-lg animate-in fade-in-0 duration-1000">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center space-y-4 animate-in slide-in-from-bottom-4 duration-800 delay-200">
              <div className="text-sm text-gray-600 dark:text-gray-400 opacity-90 transition-all duration-300 hover:opacity-100">
                © 2024 Algı Akademi. Tüm hakları saklıdır.
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm group">
                <span className="text-gray-500 dark:text-gray-500 transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                  Design by
                </span>
                <a 
                  href="https://www.3ytasarim.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 hover:scale-105 hover:underline decoration-2 underline-offset-2 transform hover:-translate-y-0.5"
                >
                  3Y Tasarım Yazılım Hizmetleri
                </a>
              </div>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-red-500/30 to-transparent mx-auto animate-pulse"></div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}