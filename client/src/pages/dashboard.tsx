import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
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
  Menu,
  Bell,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  UserPlus,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/ui/stats-card";
import CourseTable from "@/components/course-table";
import StudentTable from "@/components/student-table";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Yetkisiz Erişim",
        description: "Giriş yapmanız gerekiyor. Giriş sayfasına yönlendiriliyorsunuz...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  // Fetch recent activities
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities"],
    retry: false,
  });

  const handleLogout = async () => {
    if (user?.isManualStudent) {
      // Manual student logout
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
      // Regular Replit logout
      window.location.href = "/api/logout";
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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
      active: true
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
        { icon: Bus, label: "Danışmanlar", href: "/consultants" },
        { icon: Plug, label: "Entegrasyonlar", href: "/integrations" },
        { icon: Settings, label: "Ayarlar", href: "#" },
      ]
    },
    {
      id: "communication",
      icon: MessageSquare,
      label: "İletişim",
      href: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white transform transition-all duration-300 z-20 shadow-2xl ${
        sidebarCollapsed ? 'w-16' : 'w-72'
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
            <button
              onClick={toggleSidebarCollapse}
              className="hidden md:flex text-gray-400 hover:text-white hover:bg-slate-800/50 p-2 rounded-lg transition-all duration-200"
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
          
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-xl backdrop-blur-sm">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full overflow-hidden ring-2 ring-white/20">
                <img 
                  src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"} 
                  alt="User profile" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">
                  {user?.firstName || 'Safiye'} {user?.lastName || 'Hanım'}
                </div>
                <div className="text-xs text-primary font-medium">
                  {user?.role === 'admin' ? 'Sistem Yöneticisi' : 'Eğitmen'}
                </div>
              </div>
              <Bell size={18} className="text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          )}
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
                  <div>
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 group"
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                          <item.icon className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
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
                    
                    {expandedMenus.includes(item.id) && !sidebarCollapsed && (
                      <div className="mt-1 ml-6 space-y-1">
                        {item.submenuItems?.map((subItem, subIndex) => (
                          <Link key={subIndex} href={subItem.href}>
                            <a className="flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-slate-800/30 rounded-lg transition-all duration-200 group">
                              <div className="w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                              <subItem.icon className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                            </div>
                              <span>{subItem.label}</span>
                            </a>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href={item.href || '#'}>
                    <a className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                      item.active 
                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25' 
                        : 'text-gray-300 hover:text-white hover:bg-slate-800/50'
                    }`}>
                      <div className="w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                        <item.icon className={`w-5 h-5 transition-colors ${
                          item.active ? 'text-white' : 'text-primary group-hover:text-accent'
                        }`} />
                      </div>
                      {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                    </a>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700/50">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl ${
              sidebarCollapsed ? 'px-2' : ''
            }`}
          >
            <LogOut className={sidebarCollapsed ? "" : "mr-2"} size={18} />
            {!sidebarCollapsed && <span className="font-medium">Çıkış Yap</span>}
          </button>
        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden" 
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-white transition-all duration-300 ${
        sidebarCollapsed ? 'md:ml-20' : 'md:ml-72'
      }`}>
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-10">
          <div className="flex items-center justify-between px-8 py-5">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden mr-4 text-gray-600 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-100"
                onClick={toggleSidebar}
              >
                <Menu size={22} />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">Eğitim yönetim sistemi</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative p-3 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse"></span>
              </Button>
              <div className="flex items-center space-x-3 bg-gray-50 rounded-2xl px-4 py-2">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full overflow-hidden ring-2 ring-white shadow-md">
                  <img 
                    src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {user?.firstName || 'Safiye'} {user?.lastName || 'Hanım'}
                  </div>
                  <div className="text-xs text-primary font-medium">
                    {user?.role === 'admin' ? 'Yönetici' : 'Eğitmen'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Toplam Kursiyer"
              value={stats?.totalStudents?.toString() || "0"}
              change="+12%"
              icon={Users}
              gradient="gradient-primary"
            />
            <StatsCard
              title="Aktif Kurslar"
              value={stats?.activeCourses?.toString() || "0"}
              change="+8%"
              icon={Book}
              gradient="gradient-accent"
            />
            <StatsCard
              title="Aylık Gelir"
              value={`₺${stats?.monthlyRevenue?.toLocaleString() || "0"}`}
              change="+15%"
              icon={TrendingUp}
              gradient="bg-orange-500"
            />
            <StatsCard
              title="Tamamlama Oranı"
              value={`${stats?.completionRate || 0}%`}
              change="+5%"
              icon={BarChart3}
              gradient="bg-green-500"
            />
          </div>

          {/* Course Management Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Courses */}
            <CourseTable />

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
              <div className="p-8 bg-gradient-to-r from-slate-50 to-blue-50">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                    <Clock className="text-white" size={18} />
                  </div>
                  Hızlı İşlemler
                </h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 gap-4">
                  <Link href="/add-course">
                    <div className="group p-6 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Plus size={24} />
                          </div>
                          <span className="text-lg font-semibold">Yeni Kurs Ekle</span>
                        </div>
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/student-list">
                    <div className="group p-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <UserPlus size={24} />
                          </div>
                          <span className="text-lg font-semibold">Yeni Kursiyer Ekle</span>
                        </div>
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 gap-3 mt-6">
                  <Link href="/exam-results">
                    <div className="group p-4 rounded-xl bg-green-50 hover:bg-green-100 border border-green-200 hover:border-green-300 transition-all duration-200 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <ClipboardList className="text-white" size={18} />
                          </div>
                          <span className="font-medium text-green-800">Sınav Oluştur</span>
                        </div>
                        <ChevronRight size={16} className="text-green-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/reports">
                    <div className="group p-4 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 hover:border-orange-300 transition-all duration-200 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                            <BarChart3 className="text-white" size={18} />
                          </div>
                          <span className="font-medium text-orange-800">Raporları Görüntüle</span>
                        </div>
                        <ChevronRight size={16} className="text-orange-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="p-8 border-t border-gray-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                    <Activity className="text-white" size={14} />
                  </div>
                  Son Aktiviteler
                </h3>
                <div className="space-y-4">
                  {activitiesLoading ? (
                    <div className="animate-pulse space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-3 h-3 bg-gray-300 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activities && activities.length > 0 ? (
                    activities.slice(0, 3).map((activity: any, index: number) => (
                      <div key={activity.id || index} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-2 shadow-sm"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(activity.createdAt).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="text-gray-400" size={24} />
                      </div>
                      <p className="text-sm text-gray-500">Henüz aktivite bulunmuyor</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Student Management Table */}
          <StudentTable />
        </main>
      </div>
    </div>
  );
}
