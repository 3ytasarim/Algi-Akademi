import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Gauge, 
  Globe, 
  MessageSquare, 
  Settings, 
  Book, 
  Users, 
  ClipboardList, 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  AreaChart, 
  UserCog, 
  Bus, 
  Plug,
  Search,
  LogOut,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const menuItems = [
    {
      title: "Ana Menü",
      items: [
        { icon: Gauge, label: "Dashboard", href: "#", active: false },
        { icon: Globe, label: "Web Site Yönetimi", href: "#", active: true, hasSubmenu: true },
        { icon: MessageSquare, label: "İletişim", href: "#", active: false },
        { icon: Settings, label: "Site Ayarları", href: "#", active: false },
      ]
    },
    {
      title: "Kurs Yönetimi",
      items: [
        { icon: Book, label: "Kurs/Kursiyer İşlemleri", href: "#", active: true, hasSubmenu: true },
        { icon: Users, label: "Kursiyer Tanımlama", href: "#", active: false },
        { icon: ClipboardList, label: "Sınav Sonuçları", href: "#", active: false },
        { icon: BarChart3, label: "Kursiyer İstatistik", href: "#", active: false },
      ]
    },
    {
      title: "Raporlar",
      items: [
        { icon: TrendingUp, label: "Muhasebe", href: "#", active: true, hasSubmenu: true },
        { icon: PieChart, label: "Danışman Satış Raporu", href: "#", active: false },
        { icon: AreaChart, label: "Kurs Satış Raporu", href: "#", active: false },
      ]
    },
    {
      title: "Sistem",
      items: [
        { icon: UserCog, label: "Ayarlar", href: "#", active: true, hasSubmenu: true },
        { icon: Bus, label: "Danışmanlar", href: "#", active: false },
        { icon: Plug, label: "Entegrasyon", href: "#", active: false },
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 dark-bg text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 z-20`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-600">
          <div className="flex items-center mb-4">
            <Gauge className="text-2xl text-accent mr-3" size={32} />
            <span className="text-xl font-bold">Yönetim Paneli</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-500 rounded-full overflow-hidden">
              <img 
                src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"} 
                alt="User profile" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <div className="font-semibold">{user?.firstName || 'SAFİYE'} {user?.lastName || 'HANIM'}</div>
              <div className="text-sm text-gray-400">{user?.role === 'admin' ? 'Admin' : 'Eğitimci'}</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-600">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Ara..." 
              className="w-full bg-gray-700 text-white rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-accent border-0 placeholder:text-white/60"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-2">
              <div className="px-4 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <a
                    key={itemIndex}
                    href={item.href}
                    className={`flex items-center px-4 py-3 transition-colors ${
                      item.active 
                        ? 'bg-primary text-white rounded-r-full mr-4' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="mr-3 w-5" size={20} />
                    <span>{item.label}</span>
                    {item.hasSubmenu && (
                      <ChevronDown className="ml-auto w-4 h-4" />
                    )}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-600">
          <Button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="mr-2" size={18} />
            Çıkış Yap
          </Button>
        </div>
      </div>
    </>
  );
}
