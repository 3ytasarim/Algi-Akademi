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
  LogOut
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/ui/stats-card";
import CourseTable from "@/components/course-table";
import StudentTable from "@/components/student-table";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const menuItems = [
    {
      title: "Ana Menü",
      items: [
        { icon: Gauge, label: "Dashboard", href: "/", active: true },
        { icon: Globe, label: "Web Site Yönetimi", href: "#", active: false, hasSubmenu: true },
        { icon: MessageSquare, label: "İletişim", href: "#", active: false },
        { icon: Settings, label: "Site Ayarları", href: "#", active: false },
      ]
    },
    {
      title: "Kurs Yönetimi",
      items: [
        { icon: Book, label: "Kurs/Kursiyer İşlemleri", href: "/", active: false, hasSubmenu: true },
        { icon: Users, label: "Kursiyer Tanımlama", href: "/add-student", active: false },
        { icon: ClipboardList, label: "Sınav Sonuçları", href: "/exam-results", active: false },
        { icon: BarChart3, label: "Kursiyer İstatistik", href: "/reports", active: false },
      ]
    },
    {
      title: "Raporlar",
      items: [
        { icon: TrendingUp, label: "Muhasebe", href: "/reports", active: false, hasSubmenu: true },
        { icon: PieChart, label: "Danışman Satış Raporu", href: "/reports", active: false },
        { icon: AreaChart, label: "Kurs Satış Raporu", href: "/reports", active: false },
      ]
    },
    {
      title: "Sistem",
      items: [
        { icon: UserCog, label: "Ayarlar", href: "#", active: false, hasSubmenu: true },
        { icon: Bus, label: "Danışmanlar", href: "/consultants", active: false },
        { icon: Plug, label: "Entegrasyon", href: "/integrations", active: false },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 dark-bg text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 z-20`}>
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
              className="w-full bg-gray-700 text-white rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-accent border-0"
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
                  item.href.startsWith('#') ? (
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
                        <svg className="ml-auto w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </a>
                  ) : (
                    <Link key={itemIndex} href={item.href}>
                      <a className={`flex items-center px-4 py-3 transition-colors ${
                        item.active 
                          ? 'bg-primary text-white rounded-r-full mr-4' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}>
                        <item.icon className="mr-3 w-5" size={20} />
                        <span>{item.label}</span>
                        {item.hasSubmenu && (
                          <svg className="ml-auto w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </a>
                    </Link>
                  )
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

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden" 
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <div className="md:ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden mr-4 text-gray-600 hover:text-gray-900"
                onClick={toggleSidebar}
              >
                <Menu size={20} />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Kurs Yönetimi</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                  <img 
                    src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <span className="font-medium text-gray-900">
                  {user?.firstName || 'Safiye'} {user?.lastName || 'Hanım'}
                </span>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Hızlı İşlemler</h2>
              </div>
              <div className="p-6 space-y-4">
                <Button className="w-full gradient-primary text-white hover:opacity-90">
                  <Plus className="mr-2" size={18} />
                  Yeni Kurs Ekle
                </Button>
                <Link href="/add-student">
                  <Button className="w-full gradient-accent text-white hover:opacity-90">
                    <UserPlus className="mr-2" size={18} />
                    Yeni Kursiyer Ekle
                  </Button>
                </Link>
                <Button className="w-full bg-green-500 text-white hover:bg-green-600">
                  <ClipboardList className="mr-2" size={18} />
                  Sınav Oluştur
                </Button>
                <Link href="/reports">
                  <Button className="w-full bg-orange-500 text-white hover:bg-orange-600">
                    <BarChart3 className="mr-2" size={18} />
                    Raporları Görüntüle
                  </Button>
                </Link>
              </div>

              {/* Recent Activity */}
              <div className="p-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
                <div className="space-y-3">
                  {activitiesLoading ? (
                    <div className="animate-pulse space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activities && activities.length > 0 ? (
                    activities.slice(0, 3).map((activity: any, index: number) => (
                      <div key={activity.id || index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.createdAt).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Henüz aktivite bulunmuyor</p>
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
