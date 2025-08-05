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
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md p-8 border border-white/20">
        {/* App Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Shield className="text-white text-2xl" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Algı Akademi</h1>
          <p className="text-white/80">Eğitim Yönetim Sistemi</p>
        </div>

        {/* Role Selector */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedRole === 'student' ? 'default' : 'ghost'}
            className={`flex-1 py-3 px-4 font-medium transition-all ${
              selectedRole === 'student' 
                ? 'bg-accent text-white hover:bg-accent/90' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            onClick={() => setSelectedRole('student')}
          >
            <GraduationCap className="mr-2" size={18} />
            Eğitimci
          </Button>
          <Button
            variant={selectedRole === 'admin' ? 'default' : 'ghost'}
            className={`flex-1 py-3 px-4 font-medium transition-all ${
              selectedRole === 'admin' 
                ? 'bg-accent text-white hover:bg-accent/90' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            onClick={() => setSelectedRole('admin')}
          >
            <UserCog className="mr-2" size={18} />
            Admin
          </Button>
        </div>

        {/* Login Form */}
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <div>
            <Label className="block text-white/80 text-sm font-medium mb-2">
              E-posta Adresi
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
              <Input
                type="email"
                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="ornek@arkakademi.com"
              />
            </div>
          </div>
          
          <div>
            <Label className="block text-white/80 text-sm font-medium mb-2">
              Şifre
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
              <Input
                type={showPassword ? "text" : "password"}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-12 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center text-white/80">
              <input type="checkbox" className="mr-2 rounded" />
              Beni hatırla
            </label>
            <a href="#" className="text-accent hover:underline">
              Şifremi unuttum
            </a>
          </div>

          <Button
            type="submit"
            className="w-full bg-accent text-white py-3 rounded-xl font-semibold transition-all hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-transparent"
          >
            {selectedRole === 'admin' ? 'Admin Girişi' : 'Eğitimci Girişi'}
          </Button>
        </form>

        {/* Demo Credentials */}
        <Card className="mt-8 bg-white/10 border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center mb-3">
              <Info className="text-warning mr-2" size={18} />
              <span className="text-white font-medium">Demo Hesapları</span>
            </div>
            <div className="text-sm text-white/80 space-y-1">
              <div><strong>Admin:</strong> admin@arkakademi.com</div>
              <div><strong>Eğitimci:</strong> egitimci@arkakademi.com</div>
              <div><strong>Şifre:</strong> 123456</div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-white/60 text-xs">
          © 2024 ARK Akademi. Tüm hakları saklıdır.
        </div>
      </div>
    </div>
  );
}
