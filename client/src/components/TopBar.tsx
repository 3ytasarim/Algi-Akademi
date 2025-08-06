import { Button } from "@/components/ui/button";
import { Menu, ChevronRight, Sun, Moon, Bell } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface TopBarProps {
  toggleSidebar: () => void;
  title: string;
  subtitle?: string;
  sidebarCollapsed?: boolean;
  toggleSidebarCollapse?: () => void;
}

export default function TopBar({ toggleSidebar, title, subtitle, sidebarCollapsed, toggleSidebarCollapse }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="bg-white/90 dark:bg-black/90 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-red-500/30 sticky top-0 z-10 transition-colors duration-300">
      <div className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleSidebar}
            className="md:hidden mr-4 p-2 hover:bg-gray-100 dark:hover:bg-red-700/30 rounded-xl text-gray-700 dark:text-white"
          >
            <Menu size={20} />
          </Button>
          
          {/* Desktop collapse button */}
          {sidebarCollapsed && toggleSidebarCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebarCollapse}
              className="hidden md:flex mr-4 p-2.5 hover:bg-gray-100 dark:hover:bg-red-700/30 rounded-xl border border-gray-200 dark:border-red-600/30 bg-white dark:bg-red-900/20 shadow-sm text-gray-700 dark:text-white"
            >
              <ChevronRight size={18} className="text-red-600 dark:text-red-400" />
            </Button>
          )}
          
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 dark:from-red-400 dark:to-red-600 bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle && <p className="text-sm text-gray-500 dark:text-red-300">{subtitle}</p>}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Dark/Light Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-red-700/30 rounded-xl text-gray-700 dark:text-white"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-gray-100 dark:hover:bg-red-700/30 rounded-xl text-gray-700 dark:text-white relative"
          >
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}