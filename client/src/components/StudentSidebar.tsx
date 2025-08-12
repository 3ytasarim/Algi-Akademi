import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  GraduationCap,
  BookOpen,
  FileText,
  User,
  ChevronDown,
  ChevronRight,
  Award,
  Settings,
  LogOut,
  ChevronLeft
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoUrl from "@assets/algi_akademi_logo_1754502318927.png";

interface StudentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarCollapsed?: boolean;
  toggleSidebarCollapse?: () => void;
}

export function StudentSidebar({ isOpen, onClose, sidebarCollapsed = false, toggleSidebarCollapse }: StudentSidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["courses"]);

  // Fetch student courses from API
  const { data: courses = [] } = useQuery({
    queryKey: ["/api/student/courses"],
    retry: false,
  });

  const handleLogout = async () => {
    if (user?.isManualStudent) {
      try {
        await fetch('/api/auth/manual-logout', {
          method: 'POST',
          credentials: 'include',
        });
        window.location.href = window.location.origin;
      } catch (error) {
        console.error('Logout error:', error);
        window.location.href = window.location.origin;
      }
    } else {
      window.location.href = "/api/logout";
    }
  };



  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const menuItems = [
    {
      id: "dashboard",
      icon: Settings,
      label: "Ana Sayfa",
      href: "/student-dashboard",
      active: location === "/student-dashboard"
    },
    {
      id: "courses",
      icon: BookOpen,
      label: "Kurslarım",
      hasSubmenu: true,
      submenuItems: Array.isArray(courses) && courses.length > 0 ? 
        courses.map((course: any) => ({
          icon: FileText,
          label: course.title,
          href: `/student/course/${encodeURIComponent(course.title)}`
        })) : []
    },
    {
      id: "exams",
      icon: Award,
      label: "Sınavlarım",
      hasSubmenu: true,
      submenuItems: [],
      badge: "Yakında"
    },
    {
      id: "profile",
      icon: User,
      label: "Kişisel Bilgilerim",
      href: "/student/profile",
      active: location === "/student/profile"
    }
  ];

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-br from-red-950/95 to-black/95 text-white transform transition-all duration-300 z-20 shadow-2xl border-r border-red-500/20 ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      } ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        
        {/* Toggle Button */}
        {toggleSidebarCollapse && (
          <button
            onClick={toggleSidebarCollapse}
            className="absolute top-2 right-2 text-white/70 hover:text-white hover:bg-red-600/40 p-1.5 rounded-md transition-all duration-200 border border-red-600/30 bg-red-900/20 shadow-sm backdrop-blur-sm z-30"
            title={sidebarCollapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
          >
            {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
        
        {/* Logo Section */}
        <div className="p-6 border-b border-red-800/20 pt-12">
          <div className="flex flex-col items-center space-y-3">
            {!sidebarCollapsed ? (
              <>
                <img src={logoUrl} alt="Algı Akademi" className="w-24 h-24 rounded-xl shadow-lg" />
                <div className="text-center">
                  <h3 className="text-white font-bold text-base">Öğrenci Portalı</h3>
                  <p className="text-white/60 text-sm">👋 Merhaba {user?.firstName || 'Öğrenci'} {user?.lastName || ''}</p>
                </div>
              </>
            ) : (
              <div className="relative group">
                <img src={logoUrl} alt="AA" className="w-12 h-12 rounded-lg shadow-md hover:shadow-lg transition-all duration-200" />
                <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-xl">
                  Algı Akademi
                  <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.hasSubmenu ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-gray-300 hover:text-white hover:bg-slate-800/50 group ${
                        expandedMenus.includes(item.id) ? 'bg-slate-800/30' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-6 h-6'} flex items-center justify-center mr-3 flex-shrink-0`}>
                          <item.icon className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-colors text-primary group-hover:text-accent`} />
                        </div>
                        {!sidebarCollapsed && (
                          <span className="font-medium">{item.label}</span>
                        )}
                        {!sidebarCollapsed && item.badge && (
                          <Badge variant="secondary" className="ml-2 text-xs bg-yellow-600 text-white">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {!sidebarCollapsed && (
                        expandedMenus.includes(item.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                      )}
                    </button>
                    {sidebarCollapsed && (
                      <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30 border border-slate-600">
                        {item.label}
                      </div>
                    )}
                    
                    {expandedMenus.includes(item.id) && !sidebarCollapsed && (
                      <div className="mt-1 ml-6 space-y-1">
                        {item.submenuItems && item.submenuItems.length > 0 ? (
                          item.submenuItems.map((subItem, subIndex) => (
                            <Link key={subIndex} href={subItem.href}>
                              <div className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 group cursor-pointer ${
                                subItem.href === location 
                                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25' 
                                  : 'text-gray-400 hover:text-white hover:bg-slate-800/30'
                              }`}>
                                <div className="w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                                  <subItem.icon className="w-4 h-4 transition-colors text-gray-500 group-hover:text-primary" />
                                </div>
                                <span>{subItem.label}</span>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            {item.id === 'courses' ? 'Henüz kurs atanmamış' : 'Henüz içerik yok'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative group">
                    <Link href={item.href || '#'}>
                      <div className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer ${
                        item.active 
                          ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25' 
                          : 'text-gray-300 hover:text-white hover:bg-slate-800/50'
                      }`}>
                        <div className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-6 h-6'} flex items-center justify-center mr-3 flex-shrink-0`}>
                          <item.icon className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-colors ${
                            item.active ? 'text-white' : 'text-primary group-hover:text-accent'
                          }`} />
                        </div>
                        {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                      </div>
                    </Link>
                    {sidebarCollapsed && (
                      <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30 border border-slate-600">
                        {item.label}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-red-800/20 space-y-2">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-red-400 hover:text-red-300 hover:bg-red-900/30 group ${
              sidebarCollapsed ? 'justify-center' : 'justify-start'
            }`}
          >
            <div className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex items-center justify-center ${sidebarCollapsed ? '' : 'mr-3'} flex-shrink-0`}>
              <LogOut className={`${sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4'} transition-colors`} />
            </div>
            {!sidebarCollapsed && <span className="font-medium">Çıkış Yap</span>}
            {sidebarCollapsed && (
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30 border border-slate-600">
                Çıkış Yap
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  );
}