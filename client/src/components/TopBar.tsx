import { Button } from "@/components/ui/button";
import { Menu, ChevronRight, Sun, Moon, Bell, Clock, FileText, Key, BookOpen, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface TopBarProps {
  toggleSidebar: () => void;
  title: string;
  subtitle?: string;
  sidebarCollapsed?: boolean;
  toggleSidebarCollapse?: () => void;
}

export default function TopBar({ toggleSidebar, title, subtitle, sidebarCollapsed, toggleSidebarCollapse }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fetch student activities for notifications
  const { data: activities = [] } = useQuery({
    queryKey: ["/api/student/activities"],
    retry: false,
    enabled: !!user?.role && user.role === 'student'
  });

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'course_assigned':
        return <BookOpen size={16} className="text-blue-600" />;
      case 'course_progress':
        return <Clock size={16} className="text-orange-600" />;
      case 'password_changed':
        return <Key size={16} className="text-green-600" />;
      case 'system_notification':
        return <Bell size={16} className="text-purple-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    return activityDate.toLocaleDateString('tr-TR');
  };

  const unreadCount = activities.length > 0 ? Math.min(activities.length, 9) : 0;
  
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
          <div className="relative" ref={notificationRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-red-700/30 rounded-xl text-gray-700 dark:text-white relative"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {/* Notification Dropdown */}
            {notificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Bildirimler</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNotificationOpen(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X size={14} />
                  </Button>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {activities.length > 0 ? (
                    activities.slice(0, 10).map((activity: any) => (
                      <div key={activity.id} className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 dark:text-white font-medium">
                              {activity.description.split(':')[0]}
                            </p>
                            {activity.description.includes(':') && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                {activity.description.split(':')[1]?.trim()}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {getTimeAgo(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell size={32} className="mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Henüz bildirim yok</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}