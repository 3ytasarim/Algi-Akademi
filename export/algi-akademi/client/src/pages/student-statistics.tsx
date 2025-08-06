import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Search, FileText, Users, BookOpen, Calendar } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function StudentStatistics() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });

  // Fetch students data
  const { data: students = [], isLoading: studentsLoading } = useQuery<any[]>({
    queryKey: ["/api/students"],
  });

  // Fetch courses data for course titles
  const { data: courses = [], isLoading: coursesLoading } = useQuery<any[]>({
    queryKey: ["/api/courses"],
  });

  const isLoading = studentsLoading || coursesLoading;

  // Create expanded statistics data - each course registration becomes a separate row
  const statisticsData = students.flatMap((student: any) => {
    if (!student.selectedCourses || student.selectedCourses.length === 0) {
      return [];
    }

    return student.selectedCourses.map((courseId: string) => {
      const course = courses.find(c => c.id === courseId);
      return {
        id: `${student.id}-${courseId}`,
        kayıtTarihi: student.kayıtTarihi,
        tcKimlikNo: student.tcKimlikNo,
        adı: student.adı || student.firstName || '',
        soyadı: student.soyadı || student.lastName || '',
        danışman: student.createdBy || 'ADMIN', // Kursiyeri kim oluşturdu
        kurs: course?.title || 'Kurs bulunamadı',
        coursePrice: course?.price || '0',
        studentId: student.id,
        courseId: courseId
      };
    });
  });

  // Filter statistics based on search term and date range
  const filteredStatistics = statisticsData.filter((item: any) => {
    const matchesSearch = !searchTerm || (
      item.adı?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.soyadı?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tcKimlikNo?.includes(searchTerm) ||
      item.kurs?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesDateRange = (!dateRange.startDate || !dateRange.endDate) || (
      item.kayıtTarihi >= dateRange.startDate && 
      item.kayıtTarihi <= dateRange.endDate
    );

    return matchesSearch && matchesDateRange;
  });

  // Calculate summary statistics
  const totalRecords = filteredStatistics.length;
  const uniqueStudents = new Set(filteredStatistics.map(item => item.studentId)).size;
  const uniqueCourses = new Set(filteredStatistics.map(item => item.courseId)).size;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Belirtilmemiş';
    try {
      return format(new Date(dateString), 'dd.MM.yyyy', { locale: tr });
    } catch {
      return dateString;
    }
  };

  const getDateRangeText = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      return "Tüm kayıtlar gösteriliyor";
    }
    return `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)} tarihleri arasında ${uniqueStudents} kursiyere ${totalRecords} kayıt verilmiştir.`;
  };

  return (
    <LayoutWrapper>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Kursiyer İstatistik</h1>
            <p className="text-slate-600 mt-1">
              {getDateRangeText()}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{totalRecords}</h3>
                  <p className="text-slate-600 text-sm font-medium">Toplam Kayıt</p>
                </div>
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{uniqueStudents}</h3>
                  <p className="text-slate-600 text-sm font-medium">Toplam Kursiyer</p>
                </div>
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Users size={20} className="text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{uniqueCourses}</h3>
                  <p className="text-slate-600 text-sm font-medium">Farklı Kurs</p>
                </div>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen size={20} className="text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>


        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Arama
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Ad, soyad, T.C. veya kurs ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Başlangıç Tarihi
                </label>
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bitiş Tarihi
                </label>
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setDateRange({ startDate: "", endDate: "" });
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Filtreleri Temizle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Kursiyer Kayıt Detayları
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                <span className="ml-2 text-slate-600">Veriler yükleniyor...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold text-slate-700">KAYIT TARİHİ</TableHead>
                      <TableHead className="font-semibold text-slate-700">T.C.K.N</TableHead>
                      <TableHead className="font-semibold text-slate-700">ADI SOYADI</TableHead>
                      <TableHead className="font-semibold text-slate-700">DANIŞMAN</TableHead>
                      <TableHead className="font-semibold text-slate-700">KURS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStatistics.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                          {searchTerm || dateRange.startDate || dateRange.endDate 
                            ? "Arama kriterlerinize uygun kayıt bulunamadı." 
                            : "Henüz kursiyer kaydı bulunmuyor."
                          }
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStatistics.map((item: any) => (
                        <TableRow key={item.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium">
                            {formatDate(item.kayıtTarihi)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {item.tcKimlikNo || 'Belirtilmemiş'}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-semibold">
                                  {item.adı?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                              <span>{item.adı} {item.soyadı}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-slate-900">{item.danışman}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-slate-900">{item.kurs}</div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}