import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function CostReport() {
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
      const course = courses.find(c => c.id === courseId);
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
      studentName: `${student.adı || student.firstName || ''} ${student.soyadı || student.lastName || ''}`.trim(),
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
      item.tcKimlikNo?.includes(searchTerm) ||
      item.courses.some((course: any) => course.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const matchesDateRange = (!dateRange.startDate || !dateRange.endDate) || (
      item.kayıtTarihi >= dateRange.startDate && 
      item.kayıtTarihi <= dateRange.endDate
    );

    return matchesSearch && matchesDateRange;
  });

  // Calculate statistics
  const totalRevenue = filteredData.reduce((sum, item) => sum + item.finalPrice, 0);
  const totalDiscount = filteredData.reduce((sum, item) => sum + item.discountAmount, 0);
  const totalGrossRevenue = filteredData.reduce((sum, item) => sum + item.totalPrice, 0);
  const avgDiscountPercent = filteredData.length > 0 
    ? filteredData.reduce((sum, item) => sum + item.discountPercent, 0) / filteredData.length 
    : 0;

  // Chart data
  const courseRevenueData = courses.map(course => {
    const courseSales = filteredData.filter(item => 
      item.courses.some((c: any) => c.courseId === course.id)
    );
    const revenue = courseSales.reduce((sum, item) => {
      const courseInStudent = item.courses.find((c: any) => c.courseId === course.id);
      return sum + (courseInStudent ? item.finalPrice / item.courses.length : 0);
    }, 0);
    
    return {
      name: course.title,
      revenue: Math.round(revenue),
      sales: courseSales.length
    };
  }).filter(item => item.sales > 0);

  const monthlyRevenueData = filteredData.reduce((acc, item) => {
    if (!item.kayıtTarihi) return acc;
    
    const month = format(new Date(item.kayıtTarihi), 'MMM yyyy', { locale: tr });
    if (!acc[month]) {
      acc[month] = { month, totalRevenue: 0, discountAmount: 0, finalRevenue: 0 };
    }
    acc[month].totalRevenue += item.totalPrice;
    acc[month].discountAmount += item.discountAmount;
    acc[month].finalRevenue += item.finalPrice;
    return acc;
  }, {} as Record<string, any>);

  const monthlyData = Object.values(monthlyRevenueData).slice(-6); // Son 6 ay

  const discountDistribution = [
    { name: 'İndirim', value: totalDiscount, color: '#ef4444' },
    { name: 'Net Gelir', value: totalRevenue, color: '#22c55e' }
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Belirtilmemiş';
    try {
      return format(new Date(dateString), 'dd.MM.yyyy', { locale: tr });
    } catch {
      return dateString;
    }
  };

  return (
    <LayoutWrapper>
      <div className="p-6 space-y-6">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-500/20 dark:to-green-600/10 border-green-200/50 dark:border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-yellow-50">₺{totalRevenue.toLocaleString('tr-TR')}</h3>
                  <p className="text-slate-600 dark:text-yellow-100 text-sm font-medium">Net Gelir</p>
                </div>
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign size={20} className="text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10 border-blue-200/50 dark:border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-yellow-50">₺{totalGrossRevenue.toLocaleString('tr-TR')}</h3>
                  <p className="text-slate-600 dark:text-yellow-100 text-sm font-medium">Brüt Gelir</p>
                </div>
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp size={20} className="text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 dark:from-red-500/20 dark:to-red-600/10 border-red-200/50 dark:border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-yellow-50">₺{totalDiscount.toLocaleString('tr-TR')}</h3>
                  <p className="text-slate-600 dark:text-yellow-100 text-sm font-medium">Toplam İndirim</p>
                </div>
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Percent size={20} className="text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10 border-purple-200/50 dark:border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-yellow-50">%{avgDiscountPercent.toFixed(1)}</h3>
                  <p className="text-slate-600 dark:text-yellow-100 text-sm font-medium">Ort. İndirim Oranı</p>
                </div>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 size={20} className="text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
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
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `₺${Number(value).toLocaleString('tr-TR')}`, 
                    name === 'finalRevenue' ? 'Net Gelir' : name === 'totalRevenue' ? 'Brüt Gelir' : 'İndirim'
                  ]}
                />
                <Area type="monotone" dataKey="totalRevenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="discountAmount" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                <Line type="monotone" dataKey="finalRevenue" stroke="#22c55e" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="dark:text-yellow-50">Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-yellow-100 mb-2">Arama</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Kursiyer veya kurs ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-yellow-100 mb-2">Başlangıç Tarihi</label>
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-yellow-100 mb-2">Bitiş Tarihi</label>
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
                        <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-gray-700">
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-semibold">
                                  {item.studentName.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium dark:text-yellow-50">{item.studentName}</div>
                                <div className="text-xs text-slate-500 dark:text-yellow-100">{item.tcKimlikNo}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="dark:text-yellow-50">{formatDate(item.kayıtTarihi)}</TableCell>
                          <TableCell>
                            <div className="font-medium dark:text-yellow-50">{item.courses.length} Kurs</div>
                          </TableCell>
                          <TableCell className="text-right font-semibold dark:text-yellow-50">
                            ₺{item.totalPrice.toLocaleString('tr-TR')}
                          </TableCell>
                          <TableCell className="text-right text-red-600 dark:text-red-400 font-semibold">
                            -₺{item.discountAmount.toLocaleString('tr-TR')}
                          </TableCell>
                          <TableCell className="text-right text-green-600 dark:text-green-400 font-bold">
                            ₺{item.finalPrice.toLocaleString('tr-TR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              item.discountPercent > 50 
                                ? 'bg-red-100 text-red-800' 
                                : item.discountPercent > 25 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
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