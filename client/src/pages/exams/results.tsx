import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LayoutWrapper from "@/components/LayoutWrapper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, ClipboardList, User, Calendar, Award, Target } from "lucide-react";

interface ExamResult {
  id: string;
  score: number | null;
  correctAnswers: number | null;
  wrongAnswers: number | null;
  totalQuestions: number | null;
  passed: boolean | null;
  completedAt: string | Date | null;
  studentId: string | null;
  studentFirstName: string | null;
  studentLastName: string | null;
  studentAdı: string | null;
  studentSoyadı: string | null;
  examId: string | null;
  examTitle: string | null;
  examMaxScore: number | null;
  examPassingScore: number | null;
  courseId: string | null;
  courseTitle: string | null;
}

export default function ExamResults() {
  const { data: results = [], isLoading } = useQuery<ExamResult[]>({
    queryKey: ["/api/exam-results"],
  });

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStudentName = (result: any) => {
    if (result.studentAdı && result.studentSoyadı) {
      return `${result.studentAdı} ${result.studentSoyadı}`;
    }
    if (result.studentFirstName && result.studentLastName) {
      return `${result.studentFirstName} ${result.studentLastName}`;
    }
    return 'Bilinmeyen Öğrenci';
  };

  return (
    <LayoutWrapper>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <ClipboardList className="text-primary" size={32} />
              Tüm Sınavlar
            </h1>
            <p className="text-slate-600 dark:text-gray-400 mt-1">
              Tamamlanan tüm sınav sonuçlarını görüntüleyin
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {results.length} Sınav Tamamlandı
          </Badge>
        </div>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sınav Sonuçları</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-gray-300">Yükleniyor...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="mx-auto text-slate-400 dark:text-gray-500 mb-4" size={64} />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Henüz Tamamlanmış Sınav Yok
                </h3>
                <p className="text-slate-600 dark:text-gray-300">
                  Öğrenciler sınavları tamamladıkça burada görünecek
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          Öğrenci
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[250px]">
                        <div className="flex items-center gap-2">
                          <ClipboardList size={16} />
                          Sınav
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <Target size={16} />
                          Toplam Soru
                        </div>
                      </TableHead>
                      <TableHead className="text-center">Doğru</TableHead>
                      <TableHead className="text-center">Yanlış</TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <Award size={16} />
                          Puan
                        </div>
                      </TableHead>
                      <TableHead className="text-center">Durum</TableHead>
                      <TableHead className="min-w-[180px]">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          Tamamlanma Tarihi
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result: any) => (
                      <TableRow 
                        key={result.id}
                        className="hover:bg-slate-50 dark:hover:bg-gray-800"
                        data-testid={`result-row-${result.id}`}
                      >
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {getStudentName(result)}
                            </div>
                            {result.courseTitle && (
                              <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                                {result.courseTitle}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {result.examTitle}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                            {result.totalQuestions} Soru
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                            {result.correctAnswers} Doğru
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700">
                            {result.wrongAnswers} Yanlış
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold text-lg">
                            <span className={result.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {result.score}
                            </span>
                            <span className="text-slate-600 dark:text-gray-400 text-sm">
                              /{result.examMaxScore || 100}
                            </span>
                          </div>
                          {result.examPassingScore && (
                            <div className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                              Geçme: {result.examPassingScore}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {result.passed ? (
                            <Badge className="bg-green-600 hover:bg-green-700">
                              <CheckCircle2 size={14} className="mr-1" />
                              Başarılı
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle size={14} className="mr-1" />
                              Başarısız
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 dark:text-gray-400">
                          {formatDate(result.completedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Toplam Sınav</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {results.length}
                    </p>
                  </div>
                  <ClipboardList className="text-blue-500" size={40} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Başarılı</p>
                    <p className="text-3xl font-bold text-green-600">
                      {results.filter((r: any) => r.passed).length}
                    </p>
                  </div>
                  <CheckCircle2 className="text-green-500" size={40} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Başarısız</p>
                    <p className="text-3xl font-bold text-red-600">
                      {results.filter((r: any) => !r.passed).length}
                    </p>
                  </div>
                  <XCircle className="text-red-500" size={40} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Başarı Oranı</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {Math.round((results.filter((r: any) => r.passed).length / results.length) * 100)}%
                    </p>
                  </div>
                  <Award className="text-yellow-500" size={40} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
