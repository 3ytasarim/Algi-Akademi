import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Shield, ArrowRight } from "lucide-react";

export default function Landing() {
  const [selectedRole, setSelectedRole] = useState<'student' | 'admin'>('student');

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl animate-in zoom-in-0 duration-500 delay-200">
              <GraduationCap className="text-white" size={36} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2 animate-in fade-in-0 slide-in-from-top-2 duration-500 delay-300">
              Eğitim Yönetim Sistemi
            </h1>
          </div>

          {/* Sparkle Separator */}
          <div className="flex justify-center mb-8 animate-in fade-in-0 duration-500 delay-400">
            <div className="text-4xl animate-bounce">✨</div>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-500">
            <h2 className="text-xl font-semibold text-slate-700 mb-2">
              Hesabınıza giriş yapın
            </h2>
          </div>

          {/* Role Selection Button */}
          <div className="mb-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-600">
            <Button
              variant="outline"
              className="w-full py-4 px-6 rounded-2xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              onClick={() => setSelectedRole(selectedRole === 'student' ? 'admin' : 'student')}
            >
              <GraduationCap className="mr-3" size={20} />
              {selectedRole === 'student' ? 'Eğitimci' : 'Admin'}
            </Button>
          </div>

          {/* Main Login Button */}
          <div className="mb-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-700">
            <Button
              onClick={handleLogin}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
            >
              <Shield className="mr-3" size={20} />
              {selectedRole === 'admin' ? 'Eğitimci Girişi' : 'Eğitimci Girişi'}
              <ArrowRight className="ml-3" size={20} />
            </Button>
          </div>

          {/* Security Notice */}
          <div className="text-center mb-6 animate-in fade-in-0 duration-500 delay-800">
            <p className="text-sm text-slate-600">
              Güvenli giriş için Replit kimlik doğrulaması kullanılır
            </p>
          </div>

          {/* Footer */}
          <div className="text-center border-t border-slate-200 pt-6 animate-in fade-in-0 duration-500 delay-900">
            <p className="text-xs text-slate-500">
              © 2024 Algı Akademi. Tüm hakları saklıdır.
            </p>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-300/30 rounded-full blur-sm animate-pulse delay-1000"></div>
        <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-pink-300/30 rounded-full blur-sm animate-pulse delay-1500"></div>
        <div className="absolute top-1/2 -left-6 w-4 h-4 bg-blue-300/30 rounded-full blur-sm animate-pulse delay-2000"></div>
        <div className="absolute top-1/4 -right-6 w-5 h-5 bg-purple-300/30 rounded-full blur-sm animate-pulse delay-500"></div>
      </div>
    </div>
  );
}
