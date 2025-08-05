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
  TrendingUp, PieChart, AreaChart, UserCog, Bus, Plug, Menu, Bell, LogOut
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
        { icon: Gauge, label: "Dashboard", href: "/", active: location === "/" },
        { icon: Globe, label: "Web Site Yönetimi", href: "#", active: false, hasSubmenu: true },
        { icon: MessageSquare, label: "İletişim", href: "#", active: false },
        { icon: Settings, label: "Site Ayarları", href: "#", active: false },
      ]
    },
    {
      title: "Kurs Yönetimi",
      items: [
        { icon: Book, label: "Kurs/Kursiyer İşlemleri", href: "/", active: false, hasSubmenu: true },
        { icon: Users, label: "Kursiyer Tanımlama", href: "/add-student", active: location === "/add-student" },
        { icon: ClipboardList, label: "Sınav Sonuçları", href: "/exam-results", active: location === "/exam-results" },
        { icon: BarChart3, label: "Kursiyer İstatistik", href: "/reports", active: location === "/reports" },
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
        { icon: Bus, label: "Danışmanlar", href: "/consultants", active: location === "/consultants" },
        { icon: Plug, label: "Entegrasyon", href: "/integrations", active: location === "/integrations" },
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
              <h1 className="text-2xl font-bold text-gray-900">Kursiyer Tanımla</h1>
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

        {/* Page Content */}
        <main className="p-6">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-600">Sistem kullanıcılarını yönetin</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-white hover:bg-secondary flex items-center space-x-2">
              <Plus size={20} />
              <span>Yeni Kursiyer Ekle</span>
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Kursiyer Ekle</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* T.C. Kimlik No */}
                <div>
                  <Label htmlFor="tcNo">T.C. Kimlik No</Label>
                  <Input
                    id="tcNo"
                    type="text"
                    placeholder="T.C. Kimlik Numarası"
                    value={formData.tcNo}
                    onChange={(e) => handleInputChange('tcNo', e.target.value)}
                    maxLength={11}
                  />
                </div>

                {/* Ad */}
                <div>
                  <Label htmlFor="firstName">Adı <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Adı"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>

                {/* Soyad */}
                <div>
                  <Label htmlFor="lastName">Soyadı <span className="text-red-500">*</span></Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Soyadı"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="E-posta adresi"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>

                {/* Telefon */}
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Telefon numarası"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                {/* Doğum Tarihi */}
                <div>
                  <Label htmlFor="birthDate">Doğum Tarihi</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  />
                </div>
              </div>

              {/* Kategori Seçimi */}
              <div>
                <Label>Atanacak Kategoriler</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {categories.map((category: string) => (
                    <label key={category} className="flex items-center space-x-2 text-sm">
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
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-white hover:bg-secondary"
                  disabled={createStudentMutation.isPending}
                >
                  {createStudentMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
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