import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Shield, ArrowRight, UserCog, Eye, EyeOff, Mail, Lock, CreditCard, User } from "lucide-react";
import logoUrl from "@assets/algi_akademi_logo_1754502318927.png";

export default function Landing() {
  const [selectedRole, setSelectedRole] = useState<'student' | 'admin' | 'consultant' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginData, setLoginData] = useState({
    tcKimlikNo: '',
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAdminLogin = async () => {
    if (selectedRole === 'admin') {
      setIsLoading(true);
      
      try {
        console.log('Admin login attempt:', loginData.username, loginData.password);
        
        const response = await fetch('/api/auth/admin-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            username: loginData.username,
            password: loginData.password
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Backend admin login successful:', data);
          
          // Also store in localStorage for consistency
          const adminUser = {
            id: 'admin',
            username: 'admin',
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            isAuthenticated: true
          };
          
          localStorage.setItem('auth_user', JSON.stringify(adminUser));
          localStorage.setItem('auth_authenticated', 'true');
          console.log('Admin user stored in localStorage');
          
          toast({
            title: "Giriş Başarılı",
            description: "Admin paneline yönlendiriliyorsunuz...",
          });
          
          setIsLoading(false);
          
          // Force page reload to trigger authentication hooks
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          console.log('Backend admin login failed:', data);
          toast({
            title: "Giriş Başarısız",
            description: data.message || "Kullanıcı adı veya şifre hatalı",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Admin login error:', error);
        toast({
          title: "Giriş Hatası",
          description: "Sunucu bağlantısı hatası",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }
  };

  const handleStudentLogin = async () => {
    if (selectedRole === 'student') {
      setIsLoading(true);
      try {
        const response = await fetch('/api/auth/student-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(loginData),
        });

        const data = await response.json();

        if (response.ok) {
          toast({
            title: "Giriş Başarılı",
            description: "Hoş geldiniz!",
          });
          // Force a page refresh to clear all cached queries
          window.location.href = window.location.origin;
        } else {
          toast({
            title: "Giriş Hatası",
            description: data.message || "Giriş yapılamadı",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Bağlantı Hatası",
          description: "Sunucuya bağlanılamadı",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleConsultantLogin = async () => {
    if (selectedRole === 'consultant') {
      setIsLoading(true);
      try {
        const response = await fetch('/api/auth/consultant-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            tcKimlikNo: loginData.tcKimlikNo,
            password: loginData.password
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast({
            title: "Giriş Başarılı",
            description: "Personel paneline yönlendiriliyorsunuz...",
          });
          
          // Store user data in localStorage for client-side auth
          localStorage.setItem('auth_user', JSON.stringify(data.user));
          localStorage.setItem('auth_authenticated', 'true');
          
          // Force a page refresh to clear all cached queries
          window.location.href = window.location.origin;
        } else {
          toast({
            title: "Giriş Hatası",
            description: data.message || "Giriş yapılamadı",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Bağlantı Hatası",
          description: "Sunucuya bağlanılamadı",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLogin = selectedRole === 'admin' ? handleAdminLogin : selectedRole === 'consultant' ? handleConsultantLogin : handleStudentLogin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-gray-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-500/30 p-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-40 h-40 mx-auto mb-6 rounded-2xl flex items-center justify-center animate-in zoom-in-0 duration-500 delay-200">
              <img 
                src={logoUrl} 
                alt="Algı Akademi Logo" 
                className="w-full h-full object-contain filter drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Elegant Separator */}
          <div className="flex justify-center mb-8 animate-in fade-in-0 duration-500 delay-400">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-500">
            <h2 className="text-xl font-semibold text-white mb-2">
              Hesabınıza giriş yapın
            </h2>
            <p className="text-gray-400 text-sm">
              Eğitim yönetim sistemine hoş geldiniz
            </p>
          </div>

          {/* Step 1: Role Selection */}
          {!selectedRole && (
            <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-600">
              <Button
                variant="outline"
                className="w-full py-4 px-6 rounded-2xl border-2 border-red-500/50 bg-red-950/50 hover:bg-red-900/50 text-red-400 hover:text-red-300 font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/25"
                onClick={() => setSelectedRole('student')}
              >
                <GraduationCap className="mr-3" size={20} />
                Kursiyer
              </Button>
              
              <Button
                variant="outline"
                className="w-full py-4 px-6 rounded-2xl border-2 border-blue-500/50 bg-blue-950/50 hover:bg-blue-900/50 text-blue-400 hover:text-blue-300 font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25"
                onClick={() => setSelectedRole('consultant')}
              >
                <Shield className="mr-3" size={20} />
                Personel
              </Button>
              
              <Button
                variant="outline"
                className="w-full py-4 px-6 rounded-2xl border-2 border-gray-500/50 bg-gray-950/50 hover:bg-gray-800/50 text-gray-400 hover:text-white font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-gray-500/25"
                onClick={() => setSelectedRole('admin')}
              >
                <UserCog className="mr-3" size={20} />
                Admin
              </Button>
            </div>
          )}

          {/* Step 2: Login Form */}
          {selectedRole && (
            <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
              {/* Selected Role Display */}
              <div className="flex items-center justify-between p-4 bg-red-950/30 rounded-xl border border-red-500/30">
                <div className="flex items-center">
                  {selectedRole === 'student' ? (
                    <GraduationCap className="text-red-400 mr-3" size={20} />
                  ) : selectedRole === 'consultant' ? (
                    <Shield className="text-blue-400 mr-3" size={20} />
                  ) : (
                    <UserCog className="text-gray-400 mr-3" size={20} />
                  )}
                  <span className="font-semibold text-white">
                    {selectedRole === 'student' ? 'Kursiyer Girişi' : selectedRole === 'consultant' ? 'Personel Girişi' : 'Admin Girişi'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => setSelectedRole(null)}
                >
                  Değiştir
                </Button>
              </div>

              {/* Login Field - Different for Student vs Consultant vs Admin */}
              {selectedRole === 'student' ? (
                <div className="space-y-2">
                  <Label htmlFor="tcKimlikNo" className="text-gray-300 font-medium">
                    T.C. Kimlik No
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <Input
                      id="tcKimlikNo"
                      type="text"
                      placeholder="T.C. Kimlik Numaranız"
                      value={loginData.tcKimlikNo}
                      onChange={(e) => setLoginData(prev => ({ ...prev, tcKimlikNo: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleStudentLogin()}
                      className="pl-12 h-12 rounded-xl border-2 border-red-500/30 focus:border-red-400 bg-black/50 text-white placeholder-gray-500 backdrop-blur-sm transition-all duration-300"
                    />
                  </div>
                </div>
              ) : selectedRole === 'consultant' ? (
                <div className="space-y-2">
                  <Label htmlFor="tcKimlikNo" className="text-gray-300 font-medium">
                    T.C. Kimlik No
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <Input
                      id="tcKimlikNo"
                      type="text"
                      placeholder="T.C. Kimlik Numaranız"
                      value={loginData.tcKimlikNo}
                      onChange={(e) => setLoginData(prev => ({ ...prev, tcKimlikNo: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleConsultantLogin()}
                      className="pl-12 h-12 rounded-xl border-2 border-blue-500/30 focus:border-blue-400 bg-black/50 text-white placeholder-gray-500 backdrop-blur-sm transition-all duration-300"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300 font-medium">
                    Kullanıcı Adı
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Admin"
                      value={loginData.username || ''}
                      onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                      className="pl-12 h-12 rounded-xl border-2 border-gray-500/30 focus:border-gray-400 bg-black/50 text-white placeholder-gray-500 backdrop-blur-sm transition-all duration-300"
                    />
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 font-medium">
                  {selectedRole === 'admin' ? 'Şifre' : 'Şifre (Varsayılan: 112233)'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={selectedRole === 'admin' ? 'Şifrenizi girin' : '112233'}
                    value={loginData.password || ''}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="pl-12 pr-12 h-12 rounded-xl border-2 border-red-500/30 focus:border-red-400 bg-black/50 text-white placeholder-gray-500 backdrop-blur-sm transition-all duration-300"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 p-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-500 text-red-600 focus:ring-red-500 bg-black/50 mr-3"
                  />
                  <span className="text-sm text-gray-400 font-medium">Hatırla</span>
                </label>
                <button className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors">
                  Şifremi Unuttum
                </button>
              </div>

              {/* Login Button */}
              <Button
                onClick={handleLogin}
                disabled={isLoading || 
                  (selectedRole === 'student' && !loginData.tcKimlikNo) || 
                  (selectedRole === 'consultant' && !loginData.tcKimlikNo) || 
                  (selectedRole === 'admin' && (!loginData.username || !loginData.password))}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-lg shadow-xl shadow-red-500/25 hover:shadow-2xl hover:shadow-red-500/40 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Giriş Yapılıyor...
                  </>
                ) : (
                  <>
                    <Shield className="mr-3" size={20} />
                    Giriş
                    <ArrowRight className="ml-3" size={20} />
                  </>
                )}
              </Button>
            </div>
          )}



          {/* Footer */}
          <div className="text-center border-t border-red-500/30 pt-6 animate-in fade-in-0 duration-500 delay-900">
            <p className="text-xs text-gray-500">
              © 2024 Algı Akademi. Tüm hakları saklıdır.
            </p>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-red-500/20 rounded-full blur-sm animate-pulse delay-1000"></div>
        <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-red-600/15 rounded-full blur-sm animate-pulse delay-1500"></div>
        <div className="absolute top-1/2 -left-6 w-4 h-4 bg-gray-500/20 rounded-full blur-sm animate-pulse delay-2000"></div>
        <div className="absolute top-1/4 -right-6 w-5 h-5 bg-red-400/15 rounded-full blur-sm animate-pulse delay-500"></div>
      </div>
    </div>
  );
}
