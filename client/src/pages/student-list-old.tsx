import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LayoutWrapper from "@/components/LayoutWrapper";
import MultiStepStudentForm from "@/components/MultiStepStudentForm";
import { validateTCKimlikNo, formatTCKimlikNo } from "@/utils/tcValidation";
import { 
  User, UserPlus, Search, Calendar, CreditCard, Mail, Phone, 
  MapPin, GraduationCap, Clock, Check, X, Eye, Edit, Trash2, Camera, Upload, Users, CheckCircle, XCircle,
  ChevronRight, ChevronLeft, Briefcase, Shield, Award, Globe, TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function StudentList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 - Kişisel Bilgiler
    adı: "",
    soyadı: "",
    email: "",
    tcKimlikNo: "",
    doğumTarihi: "",
    profileImage: null as File | null,
    // Step 2 - Ek Bilgiler
    cinsiyet: "",
    meslek: "",
    kayıtTarihi: new Date().toISOString().split('T')[0],
    bitişTarihi: "",
    // Step 3 - Onaylar ve Kurslar
    isMernisOnaylı: false,
    isÜniversiteOnaylı: false,
    isEDevletOnaylı: false,
    isUluslararasıSertifikasyon: false,
    selectedCourses: [] as string[],
    discountAmount: "0",
  });
  const [tcValidation, setTcValidation] = useState<{
    isValid: boolean | null;
    message: string;
  }>({ isValid: null, message: "" });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch students
  const { data: students = [], isLoading } = useQuery({
    queryKey: ["/api/students"],
  });

  // Fetch courses for step 3
  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
  });

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: async (data: any) => {
      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formDataToSend.append(key, data[key]);
        }
      });
      return apiRequest("/api/students", "POST", formDataToSend);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setIsDialogOpen(false);
      setCurrentStep(1);
      setFormData({
        // Step 1 - Kişisel Bilgiler
        adı: "",
        soyadı: "",
        email: "",
        tcKimlikNo: "",
        doğumTarihi: "",
        profileImage: null as File | null,
        // Step 2 - Ek Bilgiler
        cinsiyet: "",
        meslek: "",
        kayıtTarihi: new Date().toISOString().split('T')[0],
        bitişTarihi: "",
        // Step 3 - Onaylar ve Kurslar
        isMernisOnaylı: false,
        isÜniversiteOnaylı: false,
        isEDevletOnaylı: false,
        isUluslararasıSertifikasyon: false,
        selectedCourses: [] as string[],
        discountAmount: "0",
      });
      setPreviewImage(null);
      setTcValidation({ isValid: null, message: "" });
      toast({
        title: "Başarılı",
        description: "Kursiyer başarıyla tanımlandı.",
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

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // T.C. Kimlik No özel kontrolü
    if (field === 'tcKimlikNo' && typeof value === 'string') {
      const cleanValue = value.replace(/\D/g, ''); // Sadece rakamları al
      if (cleanValue.length === 0) {
        setTcValidation({ isValid: null, message: "" });
      } else if (cleanValue.length < 11) {
        setTcValidation({ isValid: false, message: "T.C. Kimlik No 11 haneli olmalıdır" });
      } else if (cleanValue.length === 11) {
        const isValid = validateTCKimlikNo(cleanValue);
        setTcValidation({
          isValid,
          message: isValid ? "Geçerli T.C. Kimlik No (Mernis onaylı)" : "Geçersiz T.C. Kimlik No"
        });
        // Auto-check Mernis if TC is valid
        if (isValid) {
          setFormData(prev => ({ ...prev, isMernisOnaylı: true }));
        }
      } else {
        setTcValidation({ isValid: false, message: "T.C. Kimlik No 11 haneli olmalıdır" });
      }
    }
  };

  const calculateTotalPrice = () => {
    const selectedCoursePrices = formData.selectedCourses.map(courseId => {
      const course = (courses as any[]).find((c: any) => c.id === courseId);
      return course ? parseFloat(course.price || '0') : 0;
    });
    const total = selectedCoursePrices.reduce((sum, price) => sum + price, 0);
    const discount = parseFloat(formData.discountAmount || '0');
    return { total, discount, final: Math.max(0, total - discount) };
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
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
  const filteredStudents = (students as any[]).filter((student: any) =>
    student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.tcKimlikNo?.includes(searchTerm)
  );

  return (
    <LayoutWrapper 
      title="Kursiyer Yönetimi" 
      subtitle="Tüm kursiyerleri görüntüleyin ve yönetin"
      activeHref="/student-list"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Toplam {(students as any[]).length} Kursiyer</p>
            </div>
          </div>
        </div>
        
        <MultiStepStudentForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ["/api/students"] })}>
          <Button className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <UserPlus className="mr-2" size={18} />
            Kursiyer Tanımla
          </Button>
        </MultiStepStudentForm>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Input
            type="text"
            placeholder="Kursiyer ara (ad, soyad, email, TC kimlik no)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 rounded-xl border-2 border-slate-200 focus:border-blue-400 bg-white shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {/* Students Table */}
      <Card className="rounded-xl shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-xl">
          <CardTitle className="text-xl text-slate-900 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="text-white" size={18} />
            </div>
            Kursiyer Listesi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse">Yükleniyor...</div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">
                {searchTerm ? "Arama kriterlerine uygun kursiyer bulunamadı." : "Henüz kayıtlı kursiyer bulunmuyor."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100">
                  <TableHead className="py-4 px-6 text-slate-600 font-semibold">Kursiyer</TableHead>
                  <TableHead className="py-4 px-6 text-slate-600 font-semibold">İletişim</TableHead>
                  <TableHead className="py-4 px-6 text-slate-600 font-semibold">Durum</TableHead>
                  <TableHead className="py-4 px-6 text-slate-600 font-semibold">Kayıt Tarihi</TableHead>
                  <TableHead className="py-4 px-6 text-slate-600 font-semibold">Bitiş Tarihi</TableHead>
                  <TableHead className="py-4 px-6 text-slate-600 font-semibold text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student: any, index: number) => (
                  <TableRow key={student.id || index} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {student.firstName?.charAt(0) || student.adı?.charAt(0) || 'K'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{student.firstName || student.adı} {student.lastName || student.soyadı}</p>
                          <p className="text-sm text-slate-500">TC: {student.tcKimlikNo || 'Belirtilmemiş'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-slate-600">
                          <Mail size={14} className="mr-2" />
                          {student.email || 'Belirtilmemiş'}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Phone size={14} className="mr-2" />
                          {student.telefon || 'Belirtilmemiş'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      {(() => {
                        const today = new Date();
                        const bitişTarihi = student.bitişTarihi ? new Date(student.bitişTarihi) : null;
                        const isExpired = bitişTarihi && today > bitişTarihi;
                        
                        return isExpired ? (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                            Süresi Dolmuş
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Aktif
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-slate-600">
                      {student.createdAt ? format(new Date(student.createdAt), "dd MMM yyyy", { locale: tr }) : 'Bugün'}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-slate-600">
                      {student.bitişTarihi ? (
                        <div className={`${new Date() > new Date(student.bitişTarihi) ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                          {format(new Date(student.bitişTarihi), "dd MMM yyyy", { locale: tr })}
                        </div>
                      ) : (
                        <span className="text-slate-400">Belirsiz</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                          <Eye size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-green-600 hover:bg-green-50">
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </LayoutWrapper>
  );
}