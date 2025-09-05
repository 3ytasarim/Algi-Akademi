import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Note: Using custom avatar implementation
import { 
  Menu,
  Camera,
  Save,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  CreditCard,
  Lock
} from "lucide-react";

export default function StudentProfile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    tcKimlikNo: ''
  });

  // Fetch student profile data
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/student/profile"],
    enabled: isAuthenticated && user?.role === 'student',
  });

  // Update form when profile data is loaded
  useEffect(() => {
    if (profileData) {
      setPersonalInfo({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.telefon || '',
        tcKimlikNo: profileData.tcKimlikNo || ''
      });
    }
  }, [profileData]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handlePersonalInfoSave = async () => {
    try {
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(personalInfo),
      });

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Kişisel bilgileriniz güncellendi.",
        });
      } else {
        throw new Error('Güncelleme başarısız');
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bilgiler güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Hata",
        description: "Yeni şifreler eşleşmiyor.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Hata",
        description: "Yeni şifre en az 6 karakter olmalıdır.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/student/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Şifreniz güncellendi.",
        });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Şifre değiştirme başarısız');
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Şifre değiştirilirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900/20">
        <div className="glass-effect p-8 rounded-3xl bg-white/50 dark:bg-gray-800/50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-slate-600 dark:text-gray-300 font-medium mt-4">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900/20">
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-80 min-h-screen">
        {/* Header */}
        <header className="glass-effect border-b border-white/20 dark:border-gray-700/20 sticky top-0 z-40 backdrop-blur-xl">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden p-2"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={20} />
                </Button>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white">Kişisel Bilgiler</h1>
                  <p className="text-slate-600 dark:text-gray-300 font-medium">
                    Profil bilgilerinizi yönetin
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal">Kişisel Bilgiler</TabsTrigger>
                <TabsTrigger value="password">Şifre Değiştir</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
                <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center">
                      <User className="mr-3 text-primary" size={24} />
                      Profil Fotoğrafı
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold overflow-hidden">
                        {profileImage ? (
                          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="glass-effect"
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          <Camera className="mr-2" size={16} />
                          Fotoğraf Yükle
                        </Button>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <p className="text-sm text-slate-600 dark:text-gray-400">
                          JPG, PNG formatlarında max 2MB
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">
                      Kişisel Bilgiler
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-slate-700 dark:text-gray-300">
                          Adınız
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                          <Input
                            id="firstName"
                            value={personalInfo.firstName}
                            onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                            className="pl-10"
                            placeholder="Adınız"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-slate-700 dark:text-gray-300">
                          Soyadınız
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                          <Input
                            id="lastName"
                            value={personalInfo.lastName}
                            onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                            className="pl-10"
                            placeholder="Soyadınız"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tcKimlikNo" className="text-slate-700 dark:text-gray-300">
                          T.C. Kimlik No
                        </Label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                          <Input
                            id="tcKimlikNo"
                            value={personalInfo.tcKimlikNo}
                            disabled
                            className="pl-10 bg-gray-100 dark:bg-gray-700"
                            placeholder="T.C. Kimlik No"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-700 dark:text-gray-300">
                          Telefon Numarası
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                          <Input
                            id="phone"
                            value={personalInfo.phone}
                            onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                            className="pl-10"
                            placeholder="Telefon numaranız"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="email" className="text-slate-700 dark:text-gray-300">
                          E-Posta Adresi
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                          <Input
                            id="email"
                            type="email"
                            value={personalInfo.email}
                            onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                            className="pl-10"
                            placeholder="E-posta adresiniz"
                          />
                        </div>
                      </div>
                    </div>

                    <Button onClick={handlePersonalInfoSave} className="w-full glass-effect">
                      <Save className="mr-2" size={16} />
                      Bilgileri Kaydet
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="password" className="space-y-6">
                <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center">
                      <Lock className="mr-3 text-primary" size={24} />
                      Şifre Değiştir
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-slate-700 dark:text-gray-300">
                        Mevcut Şifre
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="pl-10 pr-10"
                          placeholder="Mevcut şifreniz"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-slate-700 dark:text-gray-300">
                        Yeni Şifre
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="pl-10 pr-10"
                          placeholder="Yeni şifreniz"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-gray-300">
                        Yeni Şifre Tekrar
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="pl-10 pr-10"
                          placeholder="Yeni şifrenizi tekrar giriniz"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </div>

                    <Button onClick={handlePasswordChange} className="w-full glass-effect">
                      <Save className="mr-2" size={16} />
                      Şifreyi Değiştir
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="mb-2 sm:mb-0">
                © 2024 Algı Akademi. Tüm hakları saklıdır.
              </div>
              <div className="flex items-center space-x-2">
                <span>Design by</span>
                <a 
                  href="https://www.3ytasarim.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200 hover:underline"
                >
                  3Y Tasarım Yazılım Hizmetleri
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}