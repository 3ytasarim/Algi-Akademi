import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, GraduationCap, UserCog, ArrowRight, Sparkles, BookOpen, Award, Users } from "lucide-react";

export default function Landing() {
  const [selectedRole, setSelectedRole] = useState<'student' | 'admin'>('student');

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-16 xl:px-24">
          <div className="max-w-xl">
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl mr-4">
                <GraduationCap className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">Algı Akademi</h1>
                <p className="text-blue-200 font-medium">Eğitim Yönetim Sistemi</p>
              </div>
            </div>

            <h2 className="text-5xl font-black text-white mb-6 leading-tight">
              Eğitimin
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Geleceği </span>
              Burada
            </h2>

            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Modern teknoloji ile güçlendirilmiş kapsamlı eğitim platformu. Öğrencilerinizi takip edin, 
              kurslarınızı yönetin ve başarıyı ölçün.
            </p>

            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="flex items-center glass-effect p-4 rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-4">
                  <BookOpen className="text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold">Akıllı Kurs Yönetimi</h3>
                  <p className="text-blue-200 text-sm">Kategori bazlı otomatik atama sistemi</p>
                </div>
              </div>

              <div className="flex items-center glass-effect p-4 rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-4">
                  <Award className="text-purple-400" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold">Gelişmiş Raporlama</h3>
                  <p className="text-blue-200 text-sm">Detaylı analitik ve performans takibi</p>
                </div>
              </div>

              <div className="flex items-center glass-effect p-4 rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mr-4">
                  <Users className="text-cyan-400" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold">Danışman Sistemi</h3>
                  <p className="text-blue-200 text-sm">Entegre CRM ve satış takibi</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 lg:flex-none lg:w-96 xl:w-[480px] flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Card className="glass-effect border-white/10 shadow-2xl backdrop-blur-xl">
              <CardContent className="p-8">
                {/* Mobile Logo */}
                <div className="lg:hidden text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl">
                    <GraduationCap className="text-white" size={28} />
                  </div>
                  <h1 className="text-3xl font-black text-white mb-2">Algı Akademi</h1>
                  <p className="text-blue-200">Eğitim Yönetim Sistemi</p>
                </div>

                <div className="text-center mb-8">
                  <div className="inline-flex items-center glass-effect px-4 py-2 rounded-full border border-white/10 mb-6">
                    <Sparkles className="text-yellow-400 mr-2" size={18} />
                    <span className="text-white font-medium text-sm">Replit ile Güvenli Giriş</span>
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">Hoş Geldiniz</h2>
                  <p className="text-blue-200">Hesabınıza giriş yapın</p>
                </div>

                {/* Role Selector */}
                <div className="flex gap-3 mb-8">
                  <Button
                    variant="ghost"
                    className={`flex-1 py-3 px-4 font-bold text-sm rounded-xl transition-all duration-300 ${
                      selectedRole === 'student' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                        : 'glass-effect text-white/80 hover:text-white border border-white/10'
                    }`}
                    onClick={() => setSelectedRole('student')}
                  >
                    <GraduationCap className="mr-2" size={18} />
                    Eğitimci
                  </Button>
                  <Button
                    variant="ghost"
                    className={`flex-1 py-3 px-4 font-bold text-sm rounded-xl transition-all duration-300 ${
                      selectedRole === 'admin' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                        : 'glass-effect text-white/80 hover:text-white border border-white/10'
                    }`}
                    onClick={() => setSelectedRole('admin')}
                  >
                    <UserCog className="mr-2" size={18} />
                    Admin
                  </Button>
                </div>

                {/* Login Button */}
                <Button
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <Shield className="mr-3" size={20} />
                  {selectedRole === 'admin' ? 'Yönetici Girişi' : 'Eğitimci Girişi'}
                  <ArrowRight className="ml-3" size={20} />
                </Button>

                <div className="mt-6 text-center">
                  <p className="text-blue-200/80 text-sm">
                    Güvenli giriş için Replit kimlik doğrulaması kullanılır
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <p className="text-blue-200/60 text-sm">
                    © 2024 Algı Akademi. Tüm hakları saklıdır.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
