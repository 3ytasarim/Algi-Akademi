import { useState } from "react";
import { useLocation } from "wouter";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ClipboardCheck,
  FileText,
  BookOpen,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Exam {
  id: string;
  title: string;
  description: string | null;
  courseId: string | null;
  maxScore: number | null;
  createdAt: string;
  questionCount?: number;
  courseName?: string;
}

export default function ExamsList() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const { data: exams = [], isLoading } = useQuery<Exam[]>({
    queryKey: ["/api/exams"],
  });

  const deleteExamMutation = useMutation({
    mutationFn: async (examId: string) => {
      return await apiRequest(`/api/exams/${examId}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Sınav başarıyla silindi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      setDeleteDialogOpen(false);
      setSelectedExam(null);
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Sınav silinirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (exam: Exam) => {
    setSelectedExam(exam);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedExam) {
      deleteExamMutation.mutate(selectedExam.id);
    }
  };

  const filteredExams = exams.filter((exam) =>
    exam.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LayoutWrapper title="Sınavlar" subtitle="Tüm sınavları görüntüle ve yönet" activeHref="/exams">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Sınav ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-exams"
              className="pl-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
            />
          </div>
          <Button
            onClick={() => navigate("/exams/new")}
            data-testid="button-new-exam"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg"
          >
            <Plus size={20} className="mr-2" />
            Yeni Sınav Ekle
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white">{exams.length}</h3>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">Toplam Sınav</p>
                </div>
                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                  <ClipboardCheck size={28} className="text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-500/20 dark:to-green-600/10 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                    {exams.reduce((sum, exam) => sum + (exam.questionCount || 0), 0)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">Toplam Soru</p>
                </div>
                <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center">
                  <FileText size={28} className="text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                    {new Set(exams.map(e => e.courseId)).size}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">Farklı Kurs</p>
                </div>
                <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                  <BookOpen size={28} className="text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exams Table */}
        <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-800/50 shadow-lg">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              </div>
            ) : filteredExams.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardCheck className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {searchQuery ? "Sınav Bulunamadı" : "Henüz Sınav Yok"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {searchQuery
                    ? "Arama kriterlerinize uygun sınav bulunamadı"
                    : "Yeni bir sınav ekleyerek başlayın"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => navigate("/exams/new")}
                    data-testid="button-new-exam-empty"
                    className="bg-gradient-to-r from-primary to-accent text-white"
                  >
                    <Plus size={20} className="mr-2" />
                    İlk Sınavı Oluştur
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100 dark:bg-gray-700/50">
                      <TableHead className="font-bold text-gray-900 dark:text-white">Sınav Adı</TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white">Kurs</TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center">Soru Sayısı</TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center">Maks. Puan</TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white">Oluşturma Tarihi</TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExams.map((exam) => (
                      <TableRow
                        key={exam.id}
                        data-testid={`row-exam-${exam.id}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <TableCell className="font-semibold text-gray-900 dark:text-white">
                          {exam.title}
                        </TableCell>
                        <TableCell>
                          {exam.courseName ? (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30">
                              {exam.courseName}
                            </Badge>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-500/30">
                            {exam.questionCount || 0} Soru
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-gray-900 dark:text-white">
                          {exam.maxScore || 100}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-300">
                          {new Date(exam.createdAt).toLocaleDateString("tr-TR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => navigate(`/exams/${exam.id}/edit`)}
                              variant="outline"
                              size="sm"
                              data-testid={`button-edit-${exam.id}`}
                              className="hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30"
                            >
                              <Edit size={16} className="mr-1" />
                              Düzenle
                            </Button>
                            <Button
                              onClick={() => handleDelete(exam)}
                              variant="outline"
                              size="sm"
                              data-testid={`button-delete-${exam.id}`}
                              className="hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30"
                            >
                              <Trash2 size={16} className="mr-1" />
                              Sil
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Sınavı Sil?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              <strong>{selectedExam?.title}</strong> sınavını silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz ve sınava ait tüm sorular silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600">
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteExamMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteExamMutation.isPending ? "Siliniyor..." : "Evet, Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LayoutWrapper>
  );
}
