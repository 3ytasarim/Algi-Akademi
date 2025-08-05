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
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'student',
        assignedCategories: data.assignedCategories
      };
      
      return await apiRequest('/api/students', 'POST', userData);
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
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Kursiyer eklenirken bir hata oluştu",
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
      <div className={`fixed left-0 top-0 h-full w-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 z-20 shadow-2xl`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-primary/20 to-accent/20">
          <div className="flex items-center mb-5">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mr-3">
              <Gauge size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Algı Akademi
              </h1>
              <p className="text-sm text-gray-400">Yönetim Paneli</p>
            </div>
          </div>
          
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
        </div>

        {/* Search */}
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
                        <item.icon className="mr-3 w-5 h-5 text-primary group-hover:text-accent transition-colors" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.includes(item.id) ? 'rotate-180' : ''}`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {expandedMenus.includes(item.id) && (
                      <div className="mt-1 ml-6 space-y-1">
                        {item.submenuItems?.map((subItem, subIndex) => (
                          <Link key={subIndex} href={subItem.href}>
                            <a className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 group ${
                              subItem.active 
                                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg' 
                                : 'text-gray-400 hover:text-white hover:bg-slate-800/30'
                            }`}>
                              <subItem.icon className={`mr-3 w-4 h-4 transition-colors ${
                                subItem.active ? 'text-white' : 'text-gray-500 group-hover:text-primary'
                              }`} />
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
                      <item.icon className={`mr-3 w-5 h-5 transition-colors ${
                        item.active ? 'text-white' : 'text-primary group-hover:text-accent'
                      }`} />
                      <span className="font-medium">{item.label}</span>
                    </a>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700/50">
          <Button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <LogOut className="mr-2" size={18} />
            <span className="font-medium">Çıkış Yap</span>
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
      <div className="md:ml-72 min-h-screen bg-gradient-to-br from-gray-50 to-white">
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
                  Kursiyer Tanımla
                </h1>
                <p className="text-sm text-gray-500 mt-1">Sistem kullanıcılarını yönetin</p>
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

        {/* Page Content */}
        <main className="p-6">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-600">Sistem kullanıcılarını yönetin</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary via-primary to-accent text-white hover:from-accent hover:to-primary flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3">
                  <Plus size={20} />
                  <span className="font-medium">Yeni Kursiyer Ekle</span>
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-[700px] max-h-[95vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border-0">
                <div className="bg-gradient-to-r from-primary to-accent p-6 rounded-t-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <User className="text-white" size={20} />
                      </div>
                      Yeni Kursiyer Ekle
                    </DialogTitle>
                    <p className="text-white/80 mt-2">Sisteme yeni bir kursiyer ekleyin ve kategorilerini belirleyin</p>
                  </DialogHeader>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Kişisel Bilgiler */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                        <User className="text-primary" size={14} />
                      </div>
                      Kişisel Bilgiler
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* T.C. Kimlik No */}
                      <div className="space-y-2">
                        <Label htmlFor="tcNo" className="text-sm font-medium text-gray-700">T.C. Kimlik No</Label>
                        <Input
                          id="tcNo"
                          type="text"
                          placeholder="11 haneli kimlik numarası"
                          value={formData.tcNo}
                          onChange={(e) => handleInputChange('tcNo', e.target.value)}
                          maxLength={11}
                          className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 h-12"
                        />
                      </div>

                      {/* Ad */}
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                          Adı <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="Adını girin"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                          className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 h-12"
                        />
                      </div>

                      {/* Soyad */}
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                          Soyadı <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Soyadını girin"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                          className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 h-12"
                        />
                      </div>

                      {/* Doğum Tarihi */}
                      <div className="space-y-2">
                        <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700">Doğum Tarihi</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => handleInputChange('birthDate', e.target.value)}
                          className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 h-12"
                        />
                      </div>
                    </div>
                  </div>

                  {/* İletişim Bilgileri */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center mr-2">
                        <Phone className="text-accent" size={14} />
                      </div>
                      İletişim Bilgileri
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">E-posta</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <Input
                            id="email"
                            type="email"
                            placeholder="ornek@email.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="pl-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 h-12"
                          />
                        </div>
                      </div>

                      {/* Telefon */}
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Telefon</Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="0555 123 45 67"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="pl-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 h-12"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kategori Seçimi */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <BookOpen className="text-green-600" size={14} />
                      </div>
                      Atanacak Kategoriler
                    </h3>
                    
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categories.map((category: string) => (
                          <label 
                            key={category} 
                            className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all duration-200"
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
                              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20"
                            />
                            <span className="text-sm font-medium text-gray-700">{category}</span>
                          </label>
                        ))}
                      </div>
                      {categories.length === 0 && (
                        <p className="text-center text-gray-500 py-4">Henüz kategori bulunmuyor</p>
                      )}
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="px-6 py-3 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-primary to-accent text-white hover:from-accent hover:to-primary px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={createStudentMutation.isPending}
                    >
                      {createStudentMutation.isPending ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Kaydediliyor...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Plus className="mr-2" size={18} />
                          Kursiyeri Kaydet
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