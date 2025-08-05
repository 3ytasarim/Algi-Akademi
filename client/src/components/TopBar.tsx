import { Button } from "@/components/ui/button";
import { Menu, ChevronRight } from "lucide-react";

interface TopBarProps {
  toggleSidebar: () => void;
  title: string;
  subtitle?: string;
  sidebarCollapsed?: boolean;
  toggleSidebarCollapse?: () => void;
}

export default function TopBar({ toggleSidebar, title, subtitle, sidebarCollapsed, toggleSidebarCollapse }: TopBarProps) {
  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-10">
      <div className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleSidebar}
            className="md:hidden mr-4 p-2 hover:bg-gray-100 rounded-xl"
          >
            <Menu size={20} />
          </Button>
          
          {/* Desktop collapse button */}
          {sidebarCollapsed && toggleSidebarCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebarCollapse}
              className="hidden md:flex mr-4 p-2.5 hover:bg-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <ChevronRight size={18} className="text-primary" />
            </Button>
          )}
          
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </div>
    </header>
  );
}