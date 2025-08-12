import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X, Check, ArrowLeft, ArrowRight, User, School, FileCheck } from "lucide-react";

interface EditStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
}

export default function EditStudentDialog({ isOpen, onClose, student }: EditStudentDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 - Kişisel Bilgiler
    adı: "",
    soyadı: "",
    email: "",
    tcKimlikNo: "",
    doğumTarihi: "",
    telefon: "",
    cinsiyet: "",
    meslek: "",
    // Step 2 - Eğitim Bilgileri
    kayıtTarihi: "",
    bitişTarihi: "",
    // Step 3 - Onaylar ve Kurslar
    isÜniversiteOnaylı: false,
    isEDevletOnaylı: false,
    isUluslararasıSertifikasyon: false,
    selectedCourses: [] as string[],
    discountAmount: "0",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch courses for step 3
  const { data: courses = [] } = useQuery<any[]>({
    queryKey: ["/api/courses"],
  });

  // Initialize form data when student changes
  useEffect(() => {
    if (student && isOpen) {
      setFormData({
        adı: student.adı || "",
        soyadı: student.soyadı || "",
        email: student.email || "",
        tcKimlikNo: student.tcKimlikNo || "",
        doğumTarihi: student.doğumTarihi || "",
        telefon: student.telefon || "",
        cinsiyet: student.cinsiyet || "",
        meslek: student.meslek || "",
        kayıtTarihi: student.kayıtTarihi || "",
        bitişTarihi: student.bitişTarihi || "",
        isÜniversiteOnaylı: student.isÜniversiteOnaylı || false,
        isEDevletOnaylı: student.isEDevletOnaylı || false,
        isUluslararasıSertifikasyon: student.isUluslararasıSertifikasyon || false,
        selectedCourses: student.selectedCourses || [],
        discountAmount: student.discountAmount || "0",
      });
      setCurrentStep(1);
    }
  }, [student, isOpen]);

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: async (data: any) => {
      const prices = calculateTotalPrice();
      
      const submitData = {
        ...data,
        totalPrice: prices.total.toString(),
        finalPrice: prices.final.toString(),
      };
      
      const response = await fetch(`/api/students/${student.id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      onClose();
      toast({
        title: "Başarılı",
        description: "Kursiyer başarıyla güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Kursiyer güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const calculateTotalPrice = () => {
    const selectedCourseObjs = courses.filter(course => 
      formData.selectedCourses.includes(course.id)
    );
    const total = selectedCourseObjs.reduce((sum, course) => sum + parseFloat(course.price || '0'), 0);
    const discount = parseFloat(formData.discountAmount || '0');
    const final = Math.max(0, total - discount);
    
    return { total, final };
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCourseToggle = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(courseId)
        ? prev.selectedCourses.filter(id => id !== courseId)
        : [...prev.selectedCourses, courseId]
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    updateStudentMutation.mutate(formData);
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <User className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Kişisel Bilgiler</h3>
          <p className="text-sm text-slate-500 dark:text-gray-400">Kursiyerin temel bilgilerini güncelleyin</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="adı">Adı</Label>
          <Input
            id="adı"
            value={formData.adı}
            onChange={(e) => handleInputChange('adı', e.target.value)}
            placeholder="Kursiyer adı"
          />
        </div>
        <div>
          <Label htmlFor="soyadı">Soyadı</Label>
          <Input
            id="soyadı"
            value={formData.soyadı}
            onChange={(e) => handleInputChange('soyadı', e.target.value)}
            placeholder="Kursiyer soyadı"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">E-posta</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="kursiyer@example.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tcKimlikNo">T.C. Kimlik No</Label>
          <Input
            id="tcKimlikNo"
            value={formData.tcKimlikNo}
            onChange={(e) => handleInputChange('tcKimlikNo', e.target.value)}
            placeholder="12345678901"
          />
        </div>
        <div>
          <Label htmlFor="telefon">Telefon</Label>
          <Input
            id="telefon"
            value={formData.telefon}
            onChange={(e) => handleInputChange('telefon', e.target.value)}
            placeholder="0555 123 45 67"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="doğumTarihi">Doğum Tarihi</Label>
          <Input
            id="doğumTarihi"
            type="date"
            value={formData.doğumTarihi}
            onChange={(e) => handleInputChange('doğumTarihi', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="cinsiyet">Cinsiyet</Label>
          <Select value={formData.cinsiyet} onValueChange={(value) => handleInputChange('cinsiyet', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Cinsiyet seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Erkek">Erkek</SelectItem>
              <SelectItem value="Kadın">Kadın</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="meslek">Meslek</Label>
        <Input
          id="meslek"
          value={formData.meslek}
          onChange={(e) => handleInputChange('meslek', e.target.value)}
          placeholder="Meslek bilgisi"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
          <School className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Eğitim Bilgileri</h3>
          <p className="text-sm text-slate-500 dark:text-gray-400">Kursiyer eğitim tarihlerini ayarlayın</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="kayıtTarihi">Kayıt Tarihi</Label>
          <Input
            id="kayıtTarihi"
            type="date"
            value={formData.kayıtTarihi}
            onChange={(e) => handleInputChange('kayıtTarihi', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="bitişTarihi">Bitiş Tarihi</Label>
          <Input
            id="bitişTarihi"
            type="date"
            value={formData.bitişTarihi}
            onChange={(e) => handleInputChange('bitişTarihi', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const prices = calculateTotalPrice();
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <FileCheck className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Onaylar ve Kurslar</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400">Belge onayları ve kurs seçimleri</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-slate-700 dark:text-slate-300">Belge Onayları</h4>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="universite"
                checked={formData.isÜniversiteOnaylı}
                onCheckedChange={(checked) => handleInputChange('isÜniversiteOnaylı', checked)}
              />
              <Label htmlFor="universite" className="text-sm">Üniversite Onaylı</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edevlet"
                checked={formData.isEDevletOnaylı}
                onCheckedChange={(checked) => handleInputChange('isEDevletOnaylı', checked)}
              />
              <Label htmlFor="edevlet" className="text-sm">E-Devlet Onaylı</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="uluslararasi"
                checked={formData.isUluslararasıSertifikasyon}
                onCheckedChange={(checked) => handleInputChange('isUluslararasıSertifikasyon', checked)}
              />
              <Label htmlFor="uluslararasi" className="text-sm">Uluslararası Sertifikasyon</Label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-slate-700 dark:text-slate-300">Kurs Seçimi</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {courses.map((course: any) => (
              <div
                key={course.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.selectedCourses.includes(course.id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700/50'
                }`}
                onClick={() => handleCourseToggle(course.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{course.title}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">{course.instructor}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">₺{course.price}</p>
                    {formData.selectedCourses.includes(course.id) && (
                      <Badge className="bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 text-xs">Seçili</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="discount">İndirim Tutarı (₺)</Label>
            <Input
              id="discount"
              type="number"
              value={formData.discountAmount}
              onChange={(e) => handleInputChange('discountAmount', e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Toplam Tutar:</span>
              <span className="font-semibold text-gray-900 dark:text-white">₺{prices.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">İndirim:</span>
              <span className="text-red-600 dark:text-red-400">-₺{parseFloat(formData.discountAmount || '0').toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-600 pt-2">
              <span className="font-semibold text-gray-900 dark:text-white">Net Tutar:</span>
              <span className="font-bold text-lg text-green-600 dark:text-green-400">₺{prices.final.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden [&>[data-radix-dialog-close]]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
              <User className="text-white" size={16} />
            </div>
            <span>Kursiyer Düzenle - {student?.adı} {student?.soyadı}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300 text-center">
            Kursiyer bilgilerini güncellemek için formu doldurun.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    step <= currentStep
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step < currentStep ? <Check size={16} /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 transition-all ${
                      step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : handlePrev}
            className="flex items-center gap-2"
          >
            {currentStep === 1 ? (
              <>
                <X size={16} />
                İptal
              </>
            ) : (
              <>
                <ArrowLeft size={16} />
                Geri
              </>
            )}
          </Button>

          <Button
            onClick={currentStep === 3 ? handleSubmit : handleNext}
            disabled={updateStudentMutation.isPending}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {currentStep === 3 ? (
              <>
                {updateStudentMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Check size={16} />
                )}
                Güncelle
              </>
            ) : (
              <>
                İlerle
                <ArrowRight size={16} />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}