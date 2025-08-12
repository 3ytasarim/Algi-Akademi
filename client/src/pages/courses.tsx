import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LayoutWrapper from "@/components/LayoutWrapper";
import { 
  Plus, Search, Edit, Trash2, BookOpen, Clock, Users, 
  Calendar, Filter, Download, Upload
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    price: "",
    sections: [{ name: "", pdfFile: null }]
  });

  const addSection = () => {
    setCourseForm(prev => ({
      ...prev,
      sections: [...prev.sections, { name: "", pdfFile: null }]
    }));
  };

  const removeSection = (index: number) => {
    setCourseForm(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const updateSection = (index: number, field: string, value: any) => {
    setCourseForm(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: any) => {
      console.log("=== EMERGENCY FRONTEND FIX ===");
      console.log("Input courseData:", courseData);
      
      try {
        const formData = new FormData();
        
        // Add course data as JSON string
        const courseDataWithoutFiles = {
          ...courseData,
          sections: courseData.sections.map((section: any) => ({
            name: section.name,
            // Don't include pdfFile in the JSON - it will be uploaded separately
          }))
        };
        
        console.log("Processed courseData:", courseDataWithoutFiles);
        formData.append('courseData', JSON.stringify(courseDataWithoutFiles));
        
        // Add PDF files for each section
        courseData.sections.forEach((section: any, index: number) => {
          if (section.pdfFile) {
            console.log(`Adding PDF for section ${index}:`, section.pdfFile.name);
            formData.append(`section_${index}_pdf`, section.pdfFile);
          }
        });
        
        console.log("Making request to /api/courses");
        const response = await fetch("/api/courses", {
          method: "POST",
          body: formData,
        });
        
        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));
        
        // Get response text first, then try to parse
        const responseText = await response.text();
        console.log("Raw response:", responseText);
        
        if (!response.ok) {
          console.error("Error response status:", response.status);
          console.error("Error response text:", responseText);
          
          // Try to parse as JSON for better error message
          try {
            const errorData = JSON.parse(responseText);
            throw new Error(errorData.message || `Server error: ${response.status}`);
          } catch (parseError) {
            throw new Error(`Failed to create course: ${response.status} - ${responseText}`);
          }
        }
        
        // Parse successful response
        const result = JSON.parse(responseText);
        console.log("Success response:", result);
        return result;
        
      } catch (error) {
        console.error("=== FRONTEND COURSE CREATION ERROR ===", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Başarılı",
        description: "Kurs başarıyla oluşturuldu.",
      });
    },
    onError: (error: any) => {
      console.error("=== DETAILED CREATE COURSE ERROR ===");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      toast({
        title: "Hata",
        description: error.message || "Kurs oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest(`/api/courses/${id}`, "PUT", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setEditingCourse(null);
      resetForm();
      toast({
        title: "Başarılı",
        description: "Kurs başarıyla güncellendi.",
      });
    },
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("=== COURSE DELETE REQUEST ===");
      console.log("Deleting course ID:", id);
      
      const response = await apiRequest(`/api/courses/${id}`, "DELETE");
      
      console.log("=== DELETE API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("OK:", response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("DELETE Error Response:", errorText);
        throw new Error(`DELETE Error ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log("=== DELETE SUCCESS ===", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("=== DELETE MUTATION SUCCESS ===", data);
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Başarılı",
        description: "Kurs başarıyla silindi.",
      });
      // Refresh the page to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error: any) => {
      console.error("=== DELETE MUTATION ERROR ===", error);
      toast({
        title: "Hata",
        description: `Kurs silinirken bir hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setCourseForm({
      title: "",
      description: "",
      price: "",
      sections: [{ name: "", pdfFile: null }]
    });
    setEditingCourse(null);
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const courseData = {
      title: courseForm.title,
      description: courseForm.description,
      instructorId: "admin", // Default instructor for admin-created courses
      price: courseForm.price || "0",
      duration: courseForm.sections.length, // Toplam ders sayısı = section sayısı
      sections: courseForm.sections, // Keep as object for JSON field
      status: "active",
      category: "Genel"
    };
    
    if (editingCourse) {
      updateCourseMutation.mutate({ id: editingCourse.id, data: courseData });
    } else {
      createCourseMutation.mutate(courseData);
    }
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title || "",
      description: course.description || "",
      price: course.price?.toString() || "",
      sections: course.sections || [{ name: "", pdfFile: null }]
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeleteCourse = (id: string) => {
    deleteCourseMutation.mutate(id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Taslak</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Tamamlandı</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Arşiv</Badge>;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'beginner':
        return <Badge variant="outline" className="text-green-600">Başlangıç</Badge>;
      case 'intermediate':
        return <Badge variant="outline" className="text-yellow-600">Orta</Badge>;
      case 'advanced':
        return <Badge variant="outline" className="text-red-600">İleri</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const filteredCourses = (courses as any[]).filter((course: any) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructorName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || course.category === filterCategory;
    const matchesStatus = filterStatus === "all" || course.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set((courses as any[]).map((c: any) => c.category).filter(Boolean)));

  return (
    <LayoutWrapper title="Kurs Yönetimi" subtitle="Kursları yönetin ve düzenleyin" activeHref="/courses">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div></div>
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              setEditingCourse(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Yeni Kurs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="dark:text-white">
                  {editingCourse ? "Kurs Düzenle" : "Yeni Kurs Oluştur"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCourse} className="space-y-6">
                {/* Kurs Bilgileri */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="dark:text-gray-200">Kurs İsmi *</Label>
                    <Input
                      value={courseForm.title}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Kurs ismini giriniz"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="dark:text-gray-200">Kurs Açıklama</Label>
                    <Textarea
                      value={courseForm.description}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Kurs ile ilgili kısa açıklama yazın"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Ders Bölümleri */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Ders Sıralaması</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addSection}
                      className="flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Bölüm Ekle
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {courseForm.sections.map((section, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 border rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <Input
                            value={section.name}
                            onChange={(e) => updateSection(index, 'name', e.target.value)}
                            placeholder="Eğitim bölümünün ismini giriniz"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`pdf-${index}`} className="cursor-pointer">
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-red-900/20 dark:hover:bg-red-800/30 rounded-md transition-colors">
                              <Upload size={16} className="dark:text-red-400" />
                              <span className="text-sm dark:text-red-300">PDF Ekle</span>
                            </div>
                          </Label>
                          <input
                            id={`pdf-${index}`}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => updateSection(index, 'pdfFile', e.target.files?.[0] || null)}
                          />
                          {section.pdfFile && (
                            <span className="text-sm text-green-600 font-medium">PDF Eklendi</span>
                          )}
                          {courseForm.sections.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSection(index)}
                              className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fiyat */}
                <div className="space-y-2">
                  <Label>Ücreti (₺)</Label>
                  <Input
                    type="number"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createCourseMutation.isPending || updateCourseMutation.isPending}
                >
                  {editingCourse ? "Kursu Güncelle" : "Kurs Oluştur"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Toplam Kurs</p>
                  <p className="text-2xl font-bold text-gray-900">{(courses as any[]).length || 0}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Aktif Kurs</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(courses as any[]).filter((c: any) => c.status === 'active').length || 0}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          

        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Kurs Listesi</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Kurs ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kategoriler</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="draft">Taslak</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="archived">Arşiv</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kurs ID</TableHead>
                  <TableHead>Kurs Adı</TableHead>
                  <TableHead>Toplam Ders</TableHead>
                  <TableHead>Kurs Fiyatı</TableHead>
                  <TableHead>Aktif/Pasif</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="animate-pulse">Yükleniyor...</div>
                    </TableCell>
                  </TableRow>
                ) : filteredCourses?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-gray-500">Kurs bulunamadı</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses?.map((course: any, index: number) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div className="font-mono text-sm text-gray-600">
                          #{(index + 1).toString().padStart(3, '0')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{course.title}</div>
                        {course.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {course.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          {course.duration || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-green-600">
                          {course.price ? `${parseFloat(course.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}` : 'Ücretsiz'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={course.status === 'active' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-red-100 text-red-800 border-red-200'
                          }
                        >
                          {course.status === 'active' ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditCourse(course)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit size={14} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Kursu Sil</AlertDialogTitle>
                                <AlertDialogDescription>
                                  "{course.title}" kursunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hayır</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteCourse(course.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Evet, Sil
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}