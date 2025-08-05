import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LayoutWrapper from "@/components/LayoutWrapper";
import { 
  Plus, Search, Edit, Trash2, BookOpen, Clock, Users, 
  DollarSign, Calendar, Filter, Download, Upload
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
    category: "",
    price: "",
    duration: "",
    instructorName: "",
    level: "beginner",
    startDate: "",
    endDate: "",
    maxStudents: "",
    status: "active"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch courses
  const { data: courses, isLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest(`/api/courses`, {
        method: "POST",
        body: JSON.stringify(data),
      });
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
      toast({
        title: "Hata",
        description: "Kurs oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest(`/api/courses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
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
      await apiRequest(`/api/courses/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Başarılı",
        description: "Kurs başarıyla silindi.",
      });
    },
  });

  const resetForm = () => {
    setCourseForm({
      title: "",
      description: "",
      category: "",
      price: "",
      duration: "",
      instructorName: "",
      level: "beginner",
      startDate: "",
      endDate: "",
      maxStudents: "",
      status: "active"
    });
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const courseData = {
      ...courseForm,
      price: parseFloat(courseForm.price) || 0,
      duration: parseInt(courseForm.duration) || 0,
      maxStudents: parseInt(courseForm.maxStudents) || 0,
      startDate: courseForm.startDate ? new Date(courseForm.startDate) : null,
      endDate: courseForm.endDate ? new Date(courseForm.endDate) : null,
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
      category: course.category || "",
      price: course.price?.toString() || "",
      duration: course.duration?.toString() || "",
      instructorName: course.instructorName || "",
      level: course.level || "beginner",
      startDate: course.startDate ? course.startDate.split('T')[0] : "",
      endDate: course.endDate ? course.endDate.split('T')[0] : "",
      maxStudents: course.maxStudents?.toString() || "",
      status: course.status || "active"
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm("Bu kursu silmek istediğinizden emin misiniz?")) {
      deleteCourseMutation.mutate(id);
    }
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

  const filteredCourses = courses?.filter((course: any) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructorName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || course.category === filterCategory;
    const matchesStatus = filterStatus === "all" || course.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(courses?.map((c: any) => c.category).filter(Boolean))];

  return (
    <LayoutWrapper>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kurs Yönetimi</h1>
            <p className="text-gray-500 mt-2">Kursları yönetin ve düzenleyin</p>
          </div>
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
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCourse ? "Kurs Düzenle" : "Yeni Kurs Oluştur"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCourse} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kurs Adı *</Label>
                    <Input
                      value={courseForm.title}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Kurs adını girin"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kategori *</Label>
                    <Input
                      value={courseForm.category}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Kategori (örn: Programlama, Tasarım)"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Açıklama</Label>
                  <Textarea
                    value={courseForm.description}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Kurs açıklaması"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Fiyat (₺)</Label>
                    <Input
                      type="number"
                      value={courseForm.price}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Süre (Saat)</Label>
                    <Input
                      type="number"
                      value={courseForm.duration}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max. Öğrenci</Label>
                    <Input
                      type="number"
                      value={courseForm.maxStudents}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, maxStudents: e.target.value }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Eğitmen Adı</Label>
                    <Input
                      value={courseForm.instructorName}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, instructorName: e.target.value }))}
                      placeholder="Eğitmen adı"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Seviye</Label>
                    <Select 
                      value={courseForm.level}
                      onValueChange={(value) => setCourseForm(prev => ({ ...prev, level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Başlangıç</SelectItem>
                        <SelectItem value="intermediate">Orta</SelectItem>
                        <SelectItem value="advanced">İleri</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Başlangıç Tarihi</Label>
                    <Input
                      type="date"
                      value={courseForm.startDate}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bitiş Tarihi</Label>
                    <Input
                      type="date"
                      value={courseForm.endDate}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Durum</Label>
                    <Select 
                      value={courseForm.status}
                      onValueChange={(value) => setCourseForm(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="draft">Taslak</SelectItem>
                        <SelectItem value="completed">Tamamlandı</SelectItem>
                        <SelectItem value="archived">Arşiv</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Toplam Kurs</p>
                  <p className="text-2xl font-bold text-gray-900">{courses?.length || 0}</p>
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
                    {courses?.filter((c: any) => c.status === 'active').length || 0}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Toplam Öğrenci</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {courses?.reduce((sum: number, c: any) => sum + (c.maxStudents || 0), 0) || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Toplam Gelir</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    ₺{courses?.reduce((sum: number, c: any) => sum + (c.price || 0), 0).toLocaleString() || 0}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
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
                  <TableHead>Kurs Adı</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Eğitmen</TableHead>
                  <TableHead>Seviye</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Oluşturma Tarihi</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="animate-pulse">Yükleniyor...</div>
                    </TableCell>
                  </TableRow>
                ) : filteredCourses?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-gray-500">Kurs bulunamadı</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses?.map((course: any) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{course.title}</div>
                          {course.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {course.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{course.category || '-'}</Badge>
                      </TableCell>
                      <TableCell>{course.instructorName || '-'}</TableCell>
                      <TableCell>{getLevelBadge(course.level)}</TableCell>
                      <TableCell>
                        {course.price ? `₺${course.price.toLocaleString()}` : 'Ücretsiz'}
                      </TableCell>
                      <TableCell>{getStatusBadge(course.status)}</TableCell>
                      <TableCell>
                        {format(new Date(course.createdAt), "dd MMM yyyy", { locale: tr })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditCourse(course)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </Button>
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