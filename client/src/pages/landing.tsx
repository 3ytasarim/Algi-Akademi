import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Shield, ArrowRight, UserCog, Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function Landing() {
  const [selectedRole, setSelectedRole] = useState<'student' | 'admin' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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

          {/* Step 1: Role Selection */}
          {!selectedRole && (
            <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-600">
              <Button
                variant="outline"
                className="w-full py-4 px-6 rounded-2xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                onClick={() => setSelectedRole('student')}
              >
                <GraduationCap className="mr-3" size={20} />
                Kursiyer
              </Button>
              
              <Button
                variant="outline"
                className="w-full py-4 px-6 rounded-2xl border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
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
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center">
                  {selectedRole === 'student' ? (
                    <GraduationCap className="text-blue-600 mr-3" size={20} />
                  ) : (
                    <UserCog className="text-purple-600 mr-3" size={20} />
                  )}
                  <span className="font-semibold text-slate-700">
                    {selectedRole === 'student' ? 'Kursiyer Girişi' : 'Admin Girişi'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700"
                  onClick={() => setSelectedRole(null)}
                >
                  Değiştir
                </Button>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  E-posta Adresi
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@akademi.com"
                    className="pl-12 h-12 rounded-xl border-2 border-slate-200 focus:border-blue-400 bg-white/80 backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Şifre
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-12 pr-12 h-12 rounded-xl border-2 border-slate-200 focus:border-blue-400 bg-white/80 backdrop-blur-sm transition-all duration-300"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2"
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
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-3"
                  />
                  <span className="text-sm text-slate-600 font-medium">Hatırla</span>
                </label>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  Şifremi Unuttum
                </button>
              </div>

              {/* Login Button */}
              <Button
                onClick={handleLogin}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
              >
                <Shield className="mr-3" size={20} />
                Giriş
                <ArrowRight className="ml-3" size={20} />
              </Button>
            </div>
          )}

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
