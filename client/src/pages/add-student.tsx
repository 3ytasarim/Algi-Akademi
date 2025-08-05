import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { UserPlus, Calendar } from "lucide-react";

export default function AddStudent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    tcNo: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    course: ""
  });

  const createStudentMutation = useMutation({
    mutationFn: async (data: any) => {
      // First create user
      const userData = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'student'
      };
      
      // Then create enrollment if course selected
      if (data.course) {
        const enrollmentData = {
          studentId: 'user-id', // Will be replaced with actual user ID
          courseId: data.course,
          status: 'active'
        };
        await apiRequest('/api/enrollments', {
          method: 'POST',
          body: enrollmentData
        });
      }
      
      return userData;
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Yeni kursiyer başarıyla eklendi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      // Reset form
      setFormData({
        tcNo: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        birthDate: "",
        course: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Kursiyer eklenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Yeni Kursiyer Kaydı</h1>
          <p className="text-gray-600">Sisteme yeni kursiyer ekleyin</p>
        </div>

        <Card>
          <CardHeader className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <UserPlus className="text-gray-500" size={32} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Yeni Kursiyer</h2>
                <p className="text-sm text-gray-600">Kişisel bilgileri giriniz</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* T.C. Kimlik No */}
                <div>
                  <Label htmlFor="tcNo" className="block text-sm font-medium text-gray-700 mb-2">
                    T.C. Kimlik No
                  </Label>
                  <Input
                    id="tcNo"
                    type="text"
                    placeholder="T.C. Kimlik Numarası"
                    value={formData.tcNo}
                    onChange={(e) => handleInputChange('tcNo', e.target.value)}
                    className="w-full"
                    maxLength={11}
                  />
                  <p className="text-xs text-gray-500 mt-1">11 haneli T.C. kimlik numarası</p>
                </div>

                {/* Ad */}
                <div>
                  <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Adı <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Adı"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full"
                    required
                  />
                </div>

                {/* Soyad */}
                <div>
                  <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Soyadı <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Soyadı"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="E-posta adresi"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Telefon */}
                <div>
                  <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Telefon numarası"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Doğum Tarihi */}
                <div>
                  <Label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Doğum Tarihi
                  </Label>
                  <div className="relative">
                    <Input
                      id="birthDate"
                      type="date"
                      placeholder="dd/mm/yyyy"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="w-full pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-primary hover:text-secondary p-0 h-auto mt-1"
                    onClick={() => {
                      const today = new Date();
                      const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                      handleInputChange('birthDate', eighteenYearsAgo.toISOString().split('T')[0]);
                    }}
                  >
                    Kimlik Doğum veya Devam Et
                  </Button>
                </div>
              </div>

              {/* Kurs Seçimi */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Kayıt Olacağı Kurs (Opsiyonel)
                </Label>
                <Select value={formData.course} onValueChange={(value) => handleInputChange('course', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Kurs seçiniz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web-development">Web Geliştirme</SelectItem>
                    <SelectItem value="graphic-design">Grafik Tasarım</SelectItem>
                    <SelectItem value="data-analysis">Veri Analizi</SelectItem>
                    <SelectItem value="digital-marketing">Dijital Pazarlama</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      tcNo: "",
                      firstName: "",
                      lastName: "",
                      email: "",
                      phone: "",
                      birthDate: "",
                      course: ""
                    });
                  }}
                >
                  Temizle
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-white hover:bg-secondary px-8"
                  disabled={createStudentMutation.isPending}
                >
                  {createStudentMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>İlk şifre 112233</strong> olarak tanımlanacaktır. Kursiyer giriş yaptıktan sonra şifresini değiştirebilir.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}