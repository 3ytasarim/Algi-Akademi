import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LayoutWrapper from "@/components/LayoutWrapper";
import { 
  User, UserPlus, Search, Calendar, CreditCard, Mail, Phone, 
  MapPin, GraduationCap, Clock, Check, X, Eye, Edit, Trash2, Camera, Upload
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function StudentList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    tcKimlikNo: "",
    email: "",
    adı: "",
    soyadı: "",
    doğumTarihi: "",
    profileImage: null as File | null,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch students
  const { data: students = [], isLoading } = useQuery({
    queryKey: ["/api/students"],
  });

  const createStudentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const studentData = {
        tcKimlikNo: data.tcKimlikNo,
        email: data.email,
        firstName: data.adı,
        lastName: data.soyadı,
        adı: data.adı,
        soyadı: data.soyadı,
        doğumTarihi: data.doğumTarihi,
        password: "112233",
        role: "student",
        isManualStudent: true,
      };
      return apiRequest("/api/students", "POST", studentData);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Yeni kursiyer başarıyla tanımlandı. Giriş şifresi: 112233",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setIsDialogOpen(false);
      setFormData({
        tcKimlikNo: "",
        email: "",
        adı: "",
        soyadı: "",
        doğumTarihi: "",
        profileImage: null,
      });
      setPreviewImage(null);
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Kursiyer tanımlanırken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStudentMutation.mutate(formData);
  };

  // Filter students based on search term
  const filteredStudents = students.filter((student: any) =>
    student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.tcKimlikNo?.includes(searchTerm)
  );

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
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="space-y-2 mt-4">
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.hasSubmenu ? (
                  <div>
                    <div className="px-4 py-3 text-gray-300 rounded-xl">
                      <div className="flex items-center">
                        <div className="w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                      </div>
                    </div>
                    {!sidebarCollapsed && (
                      <div className="mt-1 ml-6 space-y-1">
                        {item.submenuItems?.map((subItem, subIndex) => (
                          <a key={subIndex} href={subItem.href} className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 group ${
                            subItem.href === '/student-list' 
                              ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25' 
                              : 'text-gray-400 hover:text-white hover:bg-slate-800/30'
                          }`}>
                            <div className="w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                              <subItem.icon className={`w-4 h-4 transition-colors ${
                                subItem.href === '/student-list' ? 'text-white' : 'text-gray-500 group-hover:text-primary'
                              }`} />
                            </div>
                            <span>{subItem.label}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a href={item.href} className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
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

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-white transition-all duration-300 ${
        sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'
      }`}>
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-10">
          <div className="flex items-center justify-between px-8 py-5">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleSidebar}
                className="md:hidden mr-4 p-2 hover:bg-gray-100 rounded-xl"
              >
                <Menu size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Kursiyer Yönetimi
                </h1>
                <p className="text-sm text-gray-500">Tüm kursiyerleri görüntüleyin ve yönetin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Kursiyer Yönetimi</h1>
            <p className="text-slate-600 mt-1">Tüm kursiyerleri görüntüleyin ve yönetin</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <UserPlus className="mr-2" size={18} />
                Kursiyer Tanımla
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus size={20} />
                  Yeni Kursiyer Tanımla
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {/* Profile Photo Upload */}
                <div className="flex flex-col items-center space-y-4 mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera size={32} className="text-slate-400" />
                      )}
                    </div>
                    <label 
                      htmlFor="profileImage" 
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors group"
                    >
                      <Upload size={16} className="text-white group-hover:scale-110 transition-transform" />
                    </label>
                    <input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-slate-500 text-center">
                    Profil fotoğrafı yükle (isteğe bağlı)
                  </p>
                </div>

                {/* TC Kimlik No */}
                <div className="space-y-2">
                  <Label htmlFor="tcKimlikNo" className="text-slate-700 font-medium flex items-center gap-2">
                    <CreditCard size={16} />
                    T.C. Kimlik No
                  </Label>
                  <Input
                    id="tcKimlikNo"
                    type="text"
                    placeholder="T.C. Kimlik Numarası"
                    value={formData.tcKimlikNo}
                    onChange={(e) => handleInputChange('tcKimlikNo', e.target.value)}
                    className="h-11 rounded-xl border-2 border-slate-200 focus:border-blue-400"
                    required
                  />
                </div>

                {/* Ad */}
                <div className="space-y-2">
                  <Label htmlFor="adı" className="text-slate-700 font-medium flex items-center gap-2">
                    <User size={16} />
                    Adı
                  </Label>
                  <Input
                    id="adı"
                    type="text"
                    placeholder="Adı"
                    value={formData.adı}
                    onChange={(e) => handleInputChange('adı', e.target.value)}
                    className="h-11 rounded-xl border-2 border-slate-200 focus:border-blue-400"
                    required
                  />
                </div>

                {/* Soyadı */}
                <div className="space-y-2">
                  <Label htmlFor="soyadı" className="text-slate-700 font-medium flex items-center gap-2">
                    <User size={16} />
                    Soyadı
                  </Label>
                  <Input
                    id="soyadı"
                    type="text"
                    placeholder="Soyadı"
                    value={formData.soyadı}
                    onChange={(e) => handleInputChange('soyadı', e.target.value)}
                    className="h-11 rounded-xl border-2 border-slate-200 focus:border-blue-400"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium flex items-center gap-2">
                    <Mail size={16} />
                    E-posta Adresi
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="h-11 rounded-xl border-2 border-slate-200 focus:border-blue-400"
                    required
                  />
                </div>

                {/* Doğum Tarihi */}
                <div className="space-y-2">
                  <Label htmlFor="doğumTarihi" className="text-slate-700 font-medium flex items-center gap-2">
                    <Calendar size={16} />
                    Doğum Tarihi
                  </Label>
                  <Input
                    id="doğumTarihi"
                    type="date"
                    value={formData.doğumTarihi}
                    onChange={(e) => handleInputChange('doğumTarihi', e.target.value)}
                    className="h-11 rounded-xl border-2 border-slate-200 focus:border-blue-400"
                    required
                  />
                </div>

                {/* Info */}
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-700">
                    Varsayılan şifre: <span className="font-mono font-bold">112233</span>
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={createStudentMutation.isPending}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold"
                >
                  {createStudentMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2" size={16} />
                      Kursiyer Ekle
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card className="glass-effect border-0 shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  placeholder="Kursiyer ara (ad, soyad, e-posta, TC No)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-2 border-slate-200 focus:border-blue-400"
                />
              </div>
              <Badge variant="secondary" className="px-3 py-2 text-sm">
                {filteredStudents.length} Kursiyer
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="glass-effect border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
              <GraduationCap size={20} />
              Kursiyer Listesi
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-slate-600">Kursiyerler yükleniyor...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg">
                  {searchTerm ? "Arama kriterlerine uygun kursiyer bulunamadı" : "Henüz kursiyer tanımlanmamış"}
                </p>
                {!searchTerm && (
                  <p className="text-slate-400 text-sm mt-2">
                    Yeni kursiyer eklemek için "Kursiyer Tanımla" butonunu kullanın
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kursiyer</TableHead>
                      <TableHead>T.C. Kimlik No</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Doğum Tarihi</TableHead>
                      <TableHead>Kayıt Tarihi</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student: any) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                              {student.firstName?.[0]?.toUpperCase() || student.adı?.[0]?.toUpperCase() || 'K'}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {student.firstName || student.adı} {student.lastName || student.soyadı}
                              </p>
                              <p className="text-sm text-slate-500">
                                {student.isManualStudent ? 'Manuel Kayıt' : 'Sistem Kaydı'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {student.tcKimlikNo || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{student.email}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {student.doğumTarihi ? format(new Date(student.doğumTarihi), 'dd.MM.yyyy', { locale: tr }) : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {student.createdAt ? format(new Date(student.createdAt), 'dd.MM.yyyy', { locale: tr }) : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={student.role === 'student' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {student.role === 'student' ? 'Aktif' : student.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Eye size={14} />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Edit size={14} />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}