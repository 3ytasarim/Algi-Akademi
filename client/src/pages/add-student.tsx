import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, Mail, Phone, Calendar, Plus, Search, Filter, Download, Edit, Trash2,
  Gauge, Globe, MessageSquare, Settings, Book, Users, ClipboardList, BarChart3, 
  TrendingUp, PieChart, AreaChart, UserCog, Bus, Plug, Menu, Bell, LogOut, BookOpen
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function AddStudent() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    tcNo: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    assignedCategories: [] as string[]
  });

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

  // Fetch students (users with role 'student')
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/students"],
  });

  // Fetch courses for category selection
  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
  });

  const createStudentMutation = useMutation({
    mutationFn: async (data: any) => {
      const userData = {
        email: data.email || `${data.firstName?.toLowerCase()}.${data.lastName?.toLowerCase()}@student.com`,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'student',
        assignedCategories: data.assignedCategories || [],
        phone: data.phone,
        tcNo: data.tcNo,
        birthDate: data.birthDate
      };
      
      console.log('Sending student data:', userData);
      const response = await apiRequest('POST', '/api/students', userData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Yeni kursiyer başarıyla eklendi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Student creation error:', error);
      toast({
        title: "Hata",
        description: error?.message || "Kursiyer eklenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      tcNo: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      birthDate: "",
      assignedCategories: []
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "Eksik Bilgi",
        description: "Ad ve soyad alanları zorunludur",
        variant: "destructive",
      });
      return;
    }

    createStudentMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get unique categories from courses
  const categories = courses ? Array.from(new Set((courses as any[]).map((course: any) => course.category))) : [];

  // Filter students based on search term
  const filteredStudents = students ? (students as any[]).filter((student: any) => 
    student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
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
      id: "dashboard",
      icon: Gauge,
      label: "Dashboard",
      href: "/",
      active: location === "/"
    },
    {
      id: "courses",
      icon: Book,
      label: "Kurs Yönetimi",
      hasSubmenu: true,
      submenuItems: [
        { icon: Users, label: "Kursiyer Tanımlama", href: "/add-student", active: location === "/add-student" },
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
      <div className={`fixed left-0 top-0 h-full w-80 sidebar-modern text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-all duration-500 z-30`}>
        {/* Header */}
        <div className="p-8 border-b border-white/10 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/30 backdrop-blur-xl">
          <div className="flex items-center mb-6 animate-fade-in">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <Gauge size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Algı Akademi
              </h1>
              <p className="text-sm font-medium text-white/70">Eğitim Yönetim Sistemi</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg animate-slide-up">
            <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 rounded-xl overflow-hidden ring-2 ring-white/30 shadow-lg">
              <img 
                src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face"} 
                alt="User profile" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-1">
              <div className="font-bold text-white text-lg">
                {user?.firstName || 'Safiye'} {user?.lastName || 'Hanım'}
              </div>
              <div className="text-sm font-medium text-blue-200">
                {user?.role === 'admin' ? 'Sistem Yöneticisi' : 'Eğitim Uzmanı'}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 group">
                <Bell size={20} className="text-white/70 group-hover:text-white transition-colors" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-6">
          <div className="relative animate-slide-up">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <Search size={20} className="text-white/50" />
            </div>
            <Input 
              type="text" 
              placeholder="Hızlı arama ve navigasyon..." 
              className="w-full bg-white/10 backdrop-blur-lg text-white rounded-2xl py-4 pl-14 pr-6 border border-white/20 focus:border-white/40 focus:ring-0 focus:bg-white/15 placeholder:text-white/50 text-sm font-medium transition-all duration-300 shadow-lg"
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-3">
            {menuItems.map((item, index) => (
              <div key={item.id} className="animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                {item.hasSubmenu ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-white/80 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300 group backdrop-blur-sm border border-white/5 hover:border-white/20 shadow-lg"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mr-4 group-hover:bg-white/20 transition-all duration-300">
                          <item.icon size={20} className="text-white/70 group-hover:text-white transition-colors" />
                        </div>
                        <span className="font-semibold text-sm">{item.label}</span>
                      </div>
                      <svg 
                        className={`w-5 h-5 transition-all duration-300 ${expandedMenus.includes(item.id) ? 'rotate-180 text-white' : 'text-white/60'}`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {expandedMenus.includes(item.id) && (
                      <div className="ml-8 space-y-2 animate-slide-up">
                        {item.submenuItems?.map((subItem, subIndex) => (
                          <Link key={subIndex} href={subItem.href}>
                            <a className={`flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-300 group ${
                              subItem.active 
                                ? 'bg-gradient-to-r from-white/20 to-white/10 text-white shadow-lg border border-white/30 backdrop-blur-lg' 
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-300 ${
                                subItem.active ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                              }`}>
                                <subItem.icon size={16} className={`transition-colors ${
                                  subItem.active ? 'text-white' : 'text-white/50 group-hover:text-white/80'
                                }`} />
                              </div>
                              <span className="font-medium">{subItem.label}</span>
                            </a>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href={item.href || '#'}>
                    <a className={`flex items-center px-5 py-4 rounded-2xl transition-all duration-300 group backdrop-blur-sm border shadow-lg ${
                      item.active 
                        ? 'bg-gradient-to-r from-white/20 to-white/10 text-white border-white/30' 
                        : 'text-white/80 hover:text-white hover:bg-white/10 border-white/5 hover:border-white/20'
                    }`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-all duration-300 ${
                        item.active ? 'bg-white/20' : 'bg-white/10 group-hover:bg-white/20'
                      }`}>
                        <item.icon size={20} className={`transition-colors ${
                          item.active ? 'text-white' : 'text-white/70 group-hover:text-white'
                        }`} />
                      </div>
                      <span className="font-semibold text-sm">{item.label}</span>
                    </a>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-6 border-t border-white/10">
          <Button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-4 px-6 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-lg text-white rounded-2xl hover:from-red-500/30 hover:to-red-600/30 transition-all duration-300 shadow-lg hover:shadow-xl border border-red-500/30 hover:border-red-400/50 group"
          >
            <LogOut className="mr-3 group-hover:rotate-12 transition-transform duration-300" size={20} />
            <span className="font-semibold">Güvenli Çıkış</span>
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
      <div className="lg:ml-80 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
        {/* Top Bar */}
        <header className="glass-effect sticky top-0 z-20 border-b border-white/20">
          <div className="flex items-center justify-between px-8 py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-6 p-3 rounded-2xl hover:bg-white/10 transition-all duration-300 shadow-lg"
                onClick={toggleSidebar}
              >
                <Menu size={24} className="text-slate-700" />
              </Button>
              <div className="animate-fade-in">
                <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-primary to-accent bg-clip-text text-transparent">
                  Kursiyer Tanımla
                </h1>
                <p className="text-sm font-medium text-slate-600 mt-1">Eğitim sistemi kullanıcı yönetimi</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative p-4 text-slate-600 hover:text-slate-900 rounded-2xl hover:bg-white/50 transition-all duration-300 shadow-lg group"
              >
                <Bell size={22} className="group-hover:animate-pulse" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">3</span>
                </div>
              </Button>
              
              <div className="flex items-center space-x-4 bg-white/60 backdrop-blur-lg rounded-3xl px-6 py-3 shadow-lg border border-white/30 animate-slide-up">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl overflow-hidden ring-2 ring-white/50 shadow-lg">
                  <img 
                    src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face"} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-lg">
                    {user?.firstName || 'Safiye'} {user?.lastName || 'Hanım'}
                  </div>
                  <div className="text-sm font-semibold text-primary">
                    {user?.role === 'admin' ? 'Sistem Yöneticisi' : 'Eğitim Uzmanı'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div className="animate-fade-in">
              <p className="text-slate-600 font-medium text-lg">Öğrenci kayıt ve yönetim merkezi</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="button-modern text-white flex items-center space-x-3 rounded-2xl px-8 py-4 text-base font-semibold shadow-2xl">
                  <Plus size={22} />
                  <span>Yeni Kursiyer Ekle</span>
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-[800px] max-h-[95vh] overflow-y-auto card-modern rounded-3xl border-0 p-0 animate-scale-in">
                <div className="relative bg-gradient-to-br from-primary via-accent to-primary p-8 rounded-t-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl"></div>
                  <div className="relative z-10">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-black text-white flex items-center">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                          <User className="text-white" size={24} />
                        </div>
                        <div>
                          <div>Yeni Kursiyer Ekle</div>
                          <p className="text-white/80 font-medium text-lg mt-1">Sisteme yeni öğrenci kaydı oluşturun</p>
                        </div>
                      </DialogTitle>
                    </DialogHeader>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                  {/* Kişisel Bilgiler */}
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center shadow-lg">
                        <User className="text-primary" size={20} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">Kişisel Bilgiler</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* T.C. Kimlik No */}
                      <div className="space-y-3">
                        <Label htmlFor="tcNo" className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                          T.C. Kimlik No
                        </Label>
                        <Input
                          id="tcNo"
                          type="text"
                          placeholder="11 haneli kimlik numarası"
                          value={formData.tcNo}
                          onChange={(e) => handleInputChange('tcNo', e.target.value)}
                          maxLength={11}
                          className="input-modern h-14 text-base"
                        />
                      </div>

                      {/* Ad */}
                      <div className="space-y-3">
                        <Label htmlFor="firstName" className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Adı <span className="text-red-500 text-lg">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="Adını girin"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                          className="input-modern h-14 text-base"
                        />
                      </div>

                      {/* Soyad */}
                      <div className="space-y-3">
                        <Label htmlFor="lastName" className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Soyadı <span className="text-red-500 text-lg">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Soyadını girin"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                          className="input-modern h-14 text-base"
                        />
                      </div>

                      {/* Doğum Tarihi */}
                      <div className="space-y-3">
                        <Label htmlFor="birthDate" className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Doğum Tarihi
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                          <Input
                            id="birthDate"
                            type="date"
                            value={formData.birthDate}
                            onChange={(e) => handleInputChange('birthDate', e.target.value)}
                            className="input-modern h-14 text-base pl-12"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* İletişim Bilgileri */}
                  <div className="space-y-6 animate-slide-up">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-blue-500/20 rounded-2xl flex items-center justify-center shadow-lg">
                        <Phone className="text-accent" size={20} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">İletişim Bilgileri</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Email */}
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                          E-posta Adresi
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                          <Input
                            id="email"
                            type="email"
                            placeholder="ornek@email.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="input-modern h-14 text-base pl-12"
                          />
                        </div>
                      </div>

                      {/* Telefon */}
                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Telefon Numarası
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="0555 123 45 67"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="input-modern h-14 text-base pl-12"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kategori Seçimi */}
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center shadow-lg">
                        <BookOpen className="text-green-600" size={20} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">Eğitim Kategorileri</h3>
                    </div>
                    
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-3xl p-6 border border-slate-200/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((category: string) => (
                          <label 
                            key={category} 
                            className="flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 hover:border-primary/40 hover:bg-white/90 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl group"
                          >
                            <input
                              type="checkbox"
                              checked={formData.assignedCategories.includes(category)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleInputChange('assignedCategories', [...formData.assignedCategories, category]);
                                } else {
                                  handleInputChange('assignedCategories', formData.assignedCategories.filter(c => c !== category));
                                }
                              }}
                              className="w-6 h-6 rounded-lg border-2 border-slate-300 text-primary focus:ring-primary/20 focus:ring-2"
                            />
                            <span className="text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors">
                              {category}
                            </span>
                          </label>
                        ))}
                      </div>
                      {categories.length === 0 && (
                        <div className="text-center py-12">
                          <BookOpen className="mx-auto text-slate-400 mb-4" size={48} />
                          <p className="text-slate-500 font-medium">Henüz eğitim kategorisi bulunmuyor</p>
                          <p className="text-sm text-slate-400 mt-1">Kategori eklendikten sonra burada görünecek</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t border-slate-200/50">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="px-8 py-4 rounded-2xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-base transition-all duration-300"
                    >
                      İptal Et
                    </Button>
                    <Button
                      type="submit"
                      className="button-modern px-10 py-4 rounded-2xl text-base font-bold"
                      disabled={createStudentMutation.isPending}
                    >
                      {createStudentMutation.isPending ? (
                        <div className="flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Kayıt Oluşturuluyor...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <Plus size={20} />
                          <span>Kursiyeri Kaydet</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Kursiyer ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Filter size={16} />
                <span>Filtrele</span>
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Download size={16} />
                <span>Dışa Aktar</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Kayıtlı Kursiyerler</h2>
            <span className="text-sm text-gray-500">
              Toplam {filteredStudents.length} kursiyer
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {studentsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-500">Yükleniyor...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Atanan Kategoriler</TableHead>
                    <TableHead>Kayıt Tarihi</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student: any) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User size={16} className="text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {student.firstName} {student.lastName}
                              </div>
                              {student.role && (
                                <div className="text-sm text-gray-500 capitalize">{student.role}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Mail size={14} className="text-gray-400" />
                            <span className="text-sm">{student.email || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Phone size={14} className="text-gray-400" />
                            <span className="text-sm">{student.phone || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {student.assignedCategories && student.assignedCategories.length > 0 ? (
                              student.assignedCategories.map((category: string) => (
                                <span
                                  key={category}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                >
                                  {category}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">Kategori atanmamış</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-sm">
                              {student.createdAt ? new Date(student.createdAt).toLocaleDateString('tr-TR') : '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                              <Edit size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <User size={48} className="mx-auto mb-4 text-gray-400" />
                        <p>Henüz kayıtlı kursiyer bulunmuyor</p>
                        <p className="text-sm mt-1">Yeni kursiyer eklemek için yukarıdaki butonu kullanın</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
        </main>
      </div>
    </div>
  );
}