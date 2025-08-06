import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import LayoutWrapper from "@/components/LayoutWrapper";
import MultiStepStudentForm from "@/components/MultiStepStudentForm";
import EditStudentDialog from "@/components/EditStudentDialog";
import { User, UserPlus, Search, Mail, Phone, Users } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function StudentList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch students
  const { data: students = [], isLoading } = useQuery({
    queryKey: ["/api/students"],
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Başarılı",
        description: "Kursiyer başarıyla silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Kursiyer silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Filter out empty students (students without basic info)
  const validStudents = (students as any[]).filter((student: any) => 
    student.adı || student.firstName || student.tcKimlikNo
  );

  // Filter students based on search term
  const filteredStudents = validStudents.filter((student: any) =>
    student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.adı?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.soyadı?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.tcKimlikNo?.includes(searchTerm)
  );



  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setIsEditDialogOpen(true);
  };

  const handleDeleteStudent = (student: any) => {
    const studentName = `${student.firstName || student.adı} ${student.lastName || student.soyadı}`;
    if (confirm(`${studentName} adlı kursiyeri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      deleteStudentMutation.mutate(student.id);
    }
  };

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
              <p className="text-sm text-gray-500 dark:text-gray-200 font-medium">Toplam {validStudents.length} Kursiyer</p>
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
            className="pl-12 h-12 rounded-xl border-2 border-slate-200 dark:border-gray-600 focus:border-blue-400 bg-white dark:bg-gray-700 dark:text-white shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {/* Students Table */}
      <Card className="rounded-xl shadow-lg border-0 bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-100 dark:border-gray-700 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-gray-800 dark:to-gray-800 rounded-t-xl">
          <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center gap-3">
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
              <Users className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "Arama kriterlerine uygun kursiyer bulunamadı." : "Henüz kayıtlı kursiyer bulunmuyor."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-gray-700">
                  <TableHead className="py-4 px-6 text-slate-600 dark:text-slate-300 font-semibold">Kursiyer</TableHead>
                  <TableHead className="py-4 px-6 text-slate-600 dark:text-slate-300 font-semibold">İletişim</TableHead>
                  <TableHead className="py-4 px-6 text-slate-600 dark:text-slate-300 font-semibold">Durum</TableHead>
                  <TableHead className="py-4 px-6 text-slate-600 dark:text-slate-300 font-semibold">Kayıt Tarihi</TableHead>
                  <TableHead className="py-4 px-6 text-slate-600 dark:text-slate-300 font-semibold">Bitiş Tarihi</TableHead>
                  <TableHead className="py-4 px-6 text-slate-600 dark:text-slate-300 font-semibold text-center">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student: any, index: number) => (
                  <TableRow key={student.id || index} className="border-slate-100 dark:border-gray-700 hover:bg-slate-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {student.firstName?.charAt(0) || student.adı?.charAt(0) || 'K'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{student.firstName || student.adı} {student.lastName || student.soyadı}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">TC: {student.tcKimlikNo || 'Belirtilmemiş'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Mail size={14} className="mr-2" />
                          {student.email || 'Belirtilmemiş'}
                        </div>
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
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
                    <TableCell className="py-4 px-6 text-slate-600 dark:text-slate-200">
                      {student.createdAt ? format(new Date(student.createdAt), "dd MMM yyyy", { locale: tr }) : 'Bugün'}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-slate-600 dark:text-slate-200">
                      {student.bitişTarihi ? (
                        <div className={`${new Date() > new Date(student.bitişTarihi) ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-slate-600 dark:text-slate-200'}`}>
                          {format(new Date(student.bitişTarihi), "dd MMM yyyy", { locale: tr })}
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">Belirtilmemiş</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                          onClick={() => handleEditStudent(student)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteStudent(student)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
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

      {/* Edit Student Dialog */}
      <EditStudentDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingStudent(null);
        }}
        student={editingStudent}
      />
    </LayoutWrapper>
  );
}