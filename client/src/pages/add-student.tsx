import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, UserPlus, User, Calendar, CreditCard, Mail } from "lucide-react";
import { Link } from "wouter";

export default function AddStudent() {
  const [formData, setFormData] = useState({
    tcKimlikNo: "",
    email: "",
    adı: "",
    soyadı: "",
    doğumTarihi: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        password: "112233", // Default password
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
      // Reset form
      setFormData({
        tcKimlikNo: "",
        email: "",
        adı: "",
        soyadı: "",
        doğumTarihi: "",
      });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStudentMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-slate-600 hover:text-slate-800 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Yeni Kursiyer Kaydı</h1>
            <p className="text-slate-600 dark:text-gray-300 mt-1">Sisteme yeni kursiyer tanımlayın</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Card */}
          <div className="lg:col-span-2">
            <Card className="glass-effect border-0 shadow-xl dark:bg-gray-800/50 dark:border-gray-700">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <UserPlus className="text-white" size={28} />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900 dark:text-white">Kursiyer Bilgileri</CardTitle>
                    <p className="text-slate-600 dark:text-gray-300 text-sm">Aşağıdaki formu doldurun</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* TC Kimlik No */}
                  <div className="space-y-2">
                    <Label htmlFor="tcKimlikNo" className="text-slate-700 dark:text-gray-300 font-medium flex items-center gap-2">
                      <CreditCard size={16} />
                      T.C. Kimlik No
                    </Label>
                    <Input
                      id="tcKimlikNo"
                      type="text"
                      placeholder="T.C. Kimlik Numarası"
                      value={formData.tcKimlikNo}
                      onChange={(e) => handleInputChange('tcKimlikNo', e.target.value)}
                      className="h-12 rounded-xl border-2 border-slate-200 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-500 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm transition-all duration-300 dark:text-white"
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
                      className="h-12 rounded-xl border-2 border-slate-200 focus:border-blue-400 bg-white/80 backdrop-blur-sm transition-all duration-300"
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
                      className="h-12 rounded-xl border-2 border-slate-200 focus:border-blue-400 bg-white/80 backdrop-blur-sm transition-all duration-300"
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
                      className="h-12 rounded-xl border-2 border-slate-200 focus:border-blue-400 bg-white/80 backdrop-blur-sm transition-all duration-300"
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
                      className="h-12 rounded-xl border-2 border-slate-200 focus:border-blue-400 bg-white/80 backdrop-blur-sm transition-all duration-300"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={createStudentMutation.isPending}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      {createStudentMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2" size={18} />
                          Kursiyer Kaydını Et
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Card */}
          <div className="space-y-6">
            <Card className="glass-effect border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Bilgilendirme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Varsayılan Şifre</h4>
                  <p className="text-sm text-blue-700">Yeni kursiyer için varsayılan şifre: <span className="font-mono font-bold">112233</span></p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Giriş Bilgileri</h4>
                  <p className="text-sm text-green-700">Kursiyer, e-posta adresi ve 112233 şifresi ile giriş yapabilir.</p>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h4 className="font-semibold text-amber-900 mb-2">Önemli Not</h4>
                  <p className="text-sm text-amber-700">T.C. Kimlik No zorunludur ve benzersiz olmalıdır.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}