import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Gauge, MessageSquare, Settings, Book, Users, ClipboardList, BarChart3, 
  TrendingUp, PieChart, AreaChart, UserCog, Bus, Plug, Menu, Bell, 
  Search, ChevronLeft, ChevronRight, LogOut, BookOpen
} from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  activeHref?: string;
}

export default function Sidebar({ 
  sidebarOpen, 
  sidebarCollapsed, 
  toggleSidebar, 
  toggleSidebarCollapse,
  activeHref 
}: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['courses', 'system']);
  
  const handleLogout = () => {
    window.location.href = "/api/logout";
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
      icon: Gauge,
      label: "Dashboard",
      href: "/",
      active: activeHref === "/"
    },
    {
      id: "courses", 
      icon: Book,
      label: "Kurs Yönetimi",
      hasSubmenu: true,
      submenuItems: [
        { icon: Users, label: "Kursiyer Tanımlama", href: "/student-list" },
        { icon: ClipboardList, label: "Sınav Sonuçları", href: "/exam-results" },
        { icon: BarChart3, label: "Kursiyer İstatistik", href: "/reports" },
      ]
    },
    {
      id: "reports", 
      icon: TrendingUp,
      label: "Raporlar",
      hasSubmenu: true,
      submenuItems: [
        { icon: PieChart, label: "Danışman Satış Raporu", href: "/reports" },
        { icon: AreaChart, label: "Kurs Satış Raporu", href: "/reports" },
      ]
    },
    {
      id: "system",
      icon: UserCog,
      label: "Sistem Yönetimi", 
      hasSubmenu: true,
      submenuItems: [
        { icon: BookOpen, label: "Kurslar", href: "/courses" },
        { icon: Bus, label: "Danışmanlar", href: "/consultants" },
        { icon: Plug, label: "Entegrasyonlar", href: "/integrations" },
        { icon: Settings, label: "Ayarlar", href: "#" },
      ]
    },
    {
      id: "communication",
      icon: MessageSquare,
      label: "Bildirimler",
      href: "/notifications"
    }
  ];

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white transform transition-all duration-300 z-20 shadow-2xl ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-primary/20 to-accent/20">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mr-3">
                <Gauge size={24} className="text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Algı Akademi
                  </h1>
                  <p className="text-sm text-gray-400">Yönetim Paneli</p>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <button
                onClick={toggleSidebarCollapse}
                className="hidden md:flex text-gray-300 hover:text-white hover:bg-slate-700/60 p-2.5 rounded-xl transition-all duration-200 bg-slate-800/40 border border-slate-600/30"
              >
                <ChevronLeft size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        {!sidebarCollapsed && (
          <div className="p-4">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Hızlı arama..." 
                className="w-full bg-slate-800/50 text-white rounded-xl py-3 pl-12 pr-4 border border-slate-700/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/25 backdrop-blur-sm placeholder:text-gray-400"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.hasSubmenu ? (
                  <div className="relative group">
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                    >
                      <div className="flex items-center">
                        <div className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-6 h-6'} flex items-center justify-center mr-3 flex-shrink-0`}>
                          <item.icon className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'} text-primary group-hover:text-accent transition-colors`} />
                        </div>
                        {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && (
                        <svg 
                          className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.includes(item.id) ? 'rotate-180' : ''}`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    {sidebarCollapsed && (
                      <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30 border border-slate-600">
                        {item.label}
                      </div>
                    )}
                    
                    {expandedMenus.includes(item.id) && !sidebarCollapsed && (
                      <div className="mt-1 ml-6 space-y-1">
                        {item.submenuItems?.map((subItem, subIndex) => (
                          <Link key={subIndex} href={subItem.href}>
                            <div className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 group cursor-pointer ${
                              subItem.href === activeHref 
                                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25' 
                                : 'text-gray-400 hover:text-white hover:bg-slate-800/30'
                            }`}>
                              <div className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-6 h-6'} flex items-center justify-center mr-3 flex-shrink-0`}>
                                <subItem.icon className={`${sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4'} transition-colors ${
                                  subItem.href === activeHref ? 'text-white' : 'text-gray-500 group-hover:text-primary'
                                }`} />
                              </div>
                              <span>{subItem.label}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative group">
                    <Link href={item.href || '#'}>
                      <a className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
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
                      </a>
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
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="relative group">
            <button 
              onClick={handleLogout}
              className={`w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl ${
                sidebarCollapsed ? 'px-2' : ''
              }`}
            >
              <div className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-6 h-6'} flex items-center justify-center mr-0 flex-shrink-0`}>
                <LogOut className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
              </div>
              {!sidebarCollapsed && <span className="font-medium ml-2">Çıkış Yap</span>}
            </button>
            {sidebarCollapsed && (
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30 border border-slate-600">
                Çıkış Yap
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}