import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, GraduationCap, UserCog, Eye, EyeOff, Mail, Lock, Info } from "lucide-react";

export default function Landing() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'student' | 'admin'>('student');

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center p-4">
      <div className="glass-effect rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-scale-in">
        {/* App Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg animate-fade-in">
            <Shield className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Algı Akademi</h1>
          <p className="text-white/80 font-medium text-lg">Eğitim Yönetim Sistemi</p>
        </div>

        {/* Role Selector */}
        <div className="flex gap-4 mb-8 animate-slide-up">
          <Button
            variant="ghost"
            className={`flex-1 py-4 px-6 font-bold text-base rounded-2xl transition-all duration-300 ${
              selectedRole === 'student' 
                ? 'button-modern text-white shadow-lg' 
                : 'bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20 border border-white/20'
            }`}
            onClick={() => setSelectedRole('student')}
          >
            <GraduationCap className="mr-3" size={20} />
            Eğitimci
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 py-4 px-6 font-bold text-base rounded-2xl transition-all duration-300 ${
              selectedRole === 'admin' 
                ? 'button-modern text-white shadow-lg' 
                : 'bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20 border border-white/20'
            }`}
            onClick={() => setSelectedRole('admin')}
          >
            <UserCog className="mr-3" size={20} />
            Admin
          </Button>
        </div>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <div className="space-y-3">
            <Label className="block text-white font-bold text-sm uppercase tracking-wider">
              E-posta Adresi
            </Label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
              <Input
                type="email"
                className="input-modern h-14 pl-14 pr-6 text-white placeholder-white/50 text-base font-medium"
                placeholder="ornek@arkakademi.com"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="block text-white font-bold text-sm uppercase tracking-wider">
              Şifre
            </Label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
              <Input
                type={showPassword ? "text" : "password"}
                className="input-modern h-14 pl-14 pr-14 text-white placeholder-white/50 text-base font-medium"
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white p-2 rounded-xl hover:bg-white/10"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center text-white/80 cursor-pointer hover:text-white transition-colors">
              <input type="checkbox" className="mr-3 w-4 h-4 rounded border-white/30 text-accent focus:ring-accent/20" />
              <span className="font-medium">Beni hatırla</span>
            </label>
            <a href="#" className="text-white/80 hover:text-white font-medium transition-colors underline-offset-4 hover:underline">
              Şifremi unuttum?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full button-modern py-4 rounded-2xl font-bold text-lg shadow-2xl"
          >
            {selectedRole === 'admin' ? 'Yönetici Girişi' : 'Eğitimci Girişi'}
          </Button>
        </form>

        {/* Demo Credentials */}
        <Card className="mt-8 card-modern border-0 animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-accent/20 to-blue-500/20 rounded-xl flex items-center justify-center mr-3">
                <Info className="text-accent" size={18} />
              </div>
              <span className="text-slate-900 font-bold text-lg">Test Hesapları</span>
            </div>
            <div className="text-sm text-slate-700 space-y-2 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-600">Yönetici:</span>
                <span className="font-semibold">Replit ile giriş yapın</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Eğitimci:</span>
                <span className="font-semibold">Replit ile giriş yapın</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-white/70 text-sm font-medium">
          © 2024 Algı Akademi. Tüm hakları saklıdır.
        </div>
      </div>
    </div>
  );
}
