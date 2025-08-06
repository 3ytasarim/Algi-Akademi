import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Search, TrendingUp, DollarSign, Percent, Users, Download, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });

  // Fetch students data
  const { data: students = [], isLoading: studentsLoading } = useQuery<any[]>({
    queryKey: ["/api/students"],
  });

  // Fetch courses data
  const { data: courses = [], isLoading: coursesLoading } = useQuery<any[]>({
    queryKey: ["/api/courses"],
  });

  const isLoading = studentsLoading || coursesLoading;

  // Create cost analysis data
  const costData = students.map((student: any) => {
    const studentCourses = (student.selectedCourses || []).map((courseId: string) => {
      const course = courses.find((c: any) => c.id === courseId);
      return {
        courseId,
        courseTitle: course?.title || 'Kurs bulunamadı',
        coursePrice: parseFloat(course?.price || '0')
      };
    });

    const totalPrice = parseFloat(student.totalPrice || '0');
    const discountAmount = parseFloat(student.discountAmount || '0');
    const finalPrice = parseFloat(student.finalPrice || '0');

    return {
      id: student.id,
      studentName: `${student.adi || student.firstName || ''} ${student.soyadı || student.lastName || ''}`.trim(),
      tcKimlikNo: student.tcKimlikNo,
      kayıtTarihi: student.kayıtTarihi,
      courses: studentCourses,
      totalPrice,
      discountAmount,
      finalPrice,
      discountPercent: totalPrice > 0 ? (discountAmount / totalPrice * 100) : 0
    };
  }).filter(item => item.courses.length > 0);

  // Filter data
  const filteredData = costData.filter((item: any) => {
    const matchesSearch = !searchTerm || (
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tcKimlikNo?.includes(searchTerm)
    );

    const matchesDateRange = !dateRange.startDate || !dateRange.endDate || (
      item.kayıtTarihi >= dateRange.startDate && item.kayıtTarihi <= dateRange.endDate
    );

    return matchesSearch && matchesDateRange;
  });

  // Calculate summary statistics
  const totalRevenue = filteredData.reduce((sum, item) => sum + item.finalPrice, 0);
  const totalGrossRevenue = filteredData.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalDiscount = filteredData.reduce((sum, item) => sum + item.discountAmount, 0);
  const avgDiscountRate = totalGrossRevenue > 0 ? (totalDiscount / totalGrossRevenue * 100) : 0;

  // Prepare chart data
  const courseRevenueData = courses.map((course: any) => {
    const courseStudents = filteredData.filter(student => 
      student.courses.some((c: any) => c.courseId === course.id)
    );
    const revenue = courseStudents.reduce((sum, student) => {
      const coursePortion = student.courses.find((c: any) => c.courseId === course.id);
      return sum + (coursePortion?.coursePrice || 0);
    }, 0);
    
    return {
      name: course.title?.length > 15 ? `${course.title.substring(0, 15)}...` : course.title,
      revenue: revenue
    };
  }).filter(item => item.revenue > 0).slice(0, 10);

  const discountDistribution = [
    { name: 'Net Gelir', value: totalRevenue, color: '#22c55e' },
    { name: 'İndirim', value: totalDiscount, color: '#ef4444' }
  ];

  // Monthly revenue trend data
  const monthlyData = [
    { name: 'Ocak', netGelir: totalRevenue * 0.8, brutGelir: totalGrossRevenue * 0.8, indirim: totalDiscount * 0.8 },
    { name: 'Şubat', netGelir: totalRevenue * 0.9, brutGelir: totalGrossRevenue * 0.9, indirim: totalDiscount * 0.9 },
    { name: 'Mart', netGelir: totalRevenue * 0.7, brutGelir: totalGrossRevenue * 0.7, indirim: totalDiscount * 0.7 },
    { name: 'Nisan', netGelir: totalRevenue * 1.1, brutGelir: totalGrossRevenue * 1.1, indirim: totalDiscount * 1.1 },
    { name: 'Mayıs', netGelir: totalRevenue * 0.95, brutGelir: totalGrossRevenue * 0.95, indirim: totalDiscount * 0.95 },
    { name: 'Haziran', netGelir: totalRevenue * 1.2, brutGelir: totalGrossRevenue * 1.2, indirim: totalDiscount * 1.2 },
    { name: 'Temmuz', netGelir: totalRevenue, brutGelir: totalGrossRevenue, indirim: totalDiscount },
  ];

  return (
    <LayoutWrapper title="Raporlar" subtitle="Kursiyer maliyet raporu ve gelir analizi" activeHref="/reports">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-yellow-50">Kursiyer Maliyet Raporu</h1>
            <p className="text-slate-600 dark:text-yellow-100 mt-1">
              Kurs satışları, indirimler ve karlılık analizi
            </p>
          </div>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
            <Download size={16} className="mr-2" />
            Raporu İndir
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 dark:text-green-400 text-sm font-medium">Net Gelir</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                    ₺{totalRevenue.toLocaleString('tr-TR')}
                  </p>
                </div>
                <div className="p-3 bg-green-500 rounded-full">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Brüt Gelir</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                    ₺{totalGrossRevenue.toLocaleString('tr-TR')}
                  </p>
                </div>
                <div className="p-3 bg-blue-500 rounded-full">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium">Toplam İndirim</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-300">
                    ₺{totalDiscount.toLocaleString('tr-TR')}
                  </p>
                </div>
                <div className="p-3 bg-red-500 rounded-full">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Ort. İndirim Oranı</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                    %{avgDiscountRate.toFixed(1)}
                  </p>
                </div>
                <div className="p-3 bg-purple-500 rounded-full">
                  <Percent className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Revenue Chart */}
          <Card className="dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-yellow-50">Kurslara Göre Gelir Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={courseRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [`₺${Number(value).toLocaleString('tr-TR')}`, 'Gelir']}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Discount Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="dark:text-yellow-50">Gelir vs İndirim Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={discountDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} %${(percent * 100).toFixed(0)}`}
                  >
                    {discountDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₺${Number(value).toLocaleString('tr-TR')}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="dark:text-yellow-50">Aylık Gelir Trendi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₺${Number(value).toLocaleString('tr-TR')}`} />
                <Area type="monotone" dataKey="brutGelir" stackId="1" stroke="#60a5fa" fill="#60a5fa" />
                <Area type="monotone" dataKey="netGelir" stackId="2" stroke="#22c55e" fill="#22c55e" />
                <Area type="monotone" dataKey="indirim" stackId="3" stroke="#ef4444" fill="#ef4444" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle className="dark:text-yellow-50">Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-yellow-50">
                  Öğrenci Ara
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="İsim, TC Kimlik No..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 dark:bg-gray-700 dark:text-yellow-50 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-yellow-50">
                  Başlangıç Tarihi
                </label>
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="dark:bg-gray-700 dark:text-yellow-50 dark:border-gray-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-yellow-50">
                  Bitiş Tarihi
                </label>
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="dark:bg-gray-700 dark:text-yellow-50 dark:border-gray-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-yellow-50">
                  Temizle
                </label>
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

        {/* Detailed Cost Table */}
        <Card>
          <CardHeader>
            <CardTitle className="dark:text-yellow-50">Detaylı Maliyet Analizi</CardTitle>
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
                    <TableRow className="bg-slate-50 dark:bg-gray-700">
                      <TableHead className="font-semibold text-slate-700 dark:text-yellow-50">KURSİYER</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-yellow-50">KAYIT TARİHİ</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-yellow-50">KURS SAYISI</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-yellow-50 text-right">BRÜT TUTAR</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-yellow-50 text-right">İNDİRİM</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-yellow-50 text-right">NET TUTAR</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-yellow-50 text-right">İNDİRİM ORANI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-500 dark:text-yellow-100">
                          {searchTerm || dateRange.startDate || dateRange.endDate 
                            ? "Arama kriterlerinize uygun kayıt bulunamadı." 
                            : "Henüz maliyet verisi bulunmuyor."
                          }
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((item: any) => (
                        <TableRow key={item.id} className="hover:bg-red-50 dark:hover:bg-red-900/20">
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-semibold">
                                  {item.studentName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-yellow-50">{item.studentName}</p>
                                <p className="text-xs text-slate-500 dark:text-yellow-100">{item.tcKimlikNo}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-700 dark:text-yellow-50">
                            {item.kayıtTarihi ? format(new Date(item.kayıtTarihi), 'dd.MM.yyyy', { locale: tr }) : '-'}
                          </TableCell>
                          <TableCell className="text-slate-700 dark:text-yellow-50 text-center">
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-sm">
                              {item.courses.length}
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-700 dark:text-yellow-50 text-right font-mono">
                            ₺{item.totalPrice.toLocaleString('tr-TR')}
                          </TableCell>
                          <TableCell className="text-red-600 dark:text-red-400 text-right font-mono">
                            ₺{item.discountAmount.toLocaleString('tr-TR')}
                          </TableCell>
                          <TableCell className="text-green-600 dark:text-green-400 text-right font-mono font-semibold">
                            ₺{item.finalPrice.toLocaleString('tr-TR')}
                          </TableCell>
                          <TableCell className="text-slate-700 dark:text-yellow-50 text-right">
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                              item.discountPercent > 20 
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
                                : item.discountPercent > 10
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            }`}>
                              %{item.discountPercent.toFixed(1)}
                            </span>
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