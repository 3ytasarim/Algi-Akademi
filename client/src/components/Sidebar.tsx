import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Gauge, MessageSquare, Settings, Book, Users, ClipboardList, BarChart3, 
  TrendingUp, PieChart, AreaChart, UserCog, Bus, Plug, Menu, Bell, 
  Search, ChevronLeft, ChevronRight, LogOut, BookOpen, Mail, CreditCard,
  Moon, Sun
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import logoUrl from "@assets/algi_akademi_logo_1754502318927.png";

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
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['courses', 'system', 'integrations']);
  const { theme, toggleTheme } = useTheme();
  
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
        { icon: BarChart3, label: "Kursiyer İstatistik", href: "/student-statistics" },
        { icon: TrendingUp, label: "Kursiyer Maliyet Raporu", href: "/cost-report" },
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
        { icon: Settings, label: "Ayarlar", href: "#" },
      ]
    },
    {
      id: "integrations",
      icon: Plug,
      label: "Entegrasyonlar",
      hasSubmenu: true,
      submenuItems: [
        { icon: Mail, label: "E-posta Ayarları", href: "/integrations/email" },
        { icon: MessageSquare, label: "NetGSM SMS", href: "/integrations/sms" },
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
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-br from-red-950/95 to-black/95 text-white transform transition-all duration-300 z-20 shadow-2xl border-r border-red-500/20 ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-red-800/20 relative">
          <div className="flex flex-col items-center space-y-3">
            {!sidebarCollapsed ? (
              <>
                <img src={logoUrl} alt="Algı Akademi" className="w-20 h-20 rounded-xl shadow-lg" />
                <div className="text-center">
                  <h3 className="text-white font-bold text-base">Yönetim Paneli</h3>
                  <p className="text-white/60 text-sm">Admin Dashboard</p>
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
          
          {/* Toggle Button - Single button only */}
          <button
            onClick={toggleSidebarCollapse}
            className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-red-600/30 p-2 rounded-lg transition-all duration-200"
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Search */}
        {!sidebarCollapsed && (
          <div className="p-4">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Hızlı arama..." 
                className="w-full bg-red-900/30 text-white rounded-xl py-3 pl-12 pr-4 border border-red-600/50 focus:border-red-400/50 focus:ring-1 focus:ring-red-400/25 backdrop-blur-sm placeholder:text-red-300"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-300" size={18} />
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
                      className="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:text-white hover:bg-red-800/50 rounded-xl transition-all duration-200 group"
                    >
                      <div className="flex items-center">
                        <div className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-6 h-6'} flex items-center justify-center mr-3 flex-shrink-0`}>
                          <item.icon className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'} text-red-400 group-hover:text-red-300 transition-colors`} />
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

        {/* Theme Toggle & Logout Section */}
        <div className="p-4 border-t border-red-800/20 bg-gradient-to-r from-red-950/60 to-red-900/40 space-y-2">
          {/* Theme Toggle */}
          <div className="relative group">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center space-x-3 p-3 rounded-xl text-white hover:bg-red-700/30 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-red-700 rounded-xl flex items-center justify-center">
                {theme === 'dark' ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">{theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}</p>
                  <p className="text-xs text-red-200">Görünümü değiştir</p>
                </div>
              )}
            </button>
            {sidebarCollapsed && (
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30 shadow-xl">
                {theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
              </div>
            )}
          </div>
          
          {/* Logout Button */}
          <div className="relative group">
            <button 
              onClick={() => window.location.href = '/api/logout'}
              className="w-full flex items-center space-x-3 p-3 rounded-xl text-white hover:bg-red-700/30 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-red-700 rounded-xl flex items-center justify-center">
                <LogOut className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">Çıkış Yap</p>
                  <p className="text-xs text-red-200">Güvenli çıkış</p>
                </div>
              )}
            </button>
            {sidebarCollapsed && (
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30 shadow-xl">
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