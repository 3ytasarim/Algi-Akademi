import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ClipboardList,
  Calendar,
  Download,
  Filter,
  Search
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function ExamResults() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Fetch exam results
  const { data: examResults, isLoading } = useQuery({
    queryKey: ["/api/exam-results"],
    retry: false,
  });

  // Mock exam results data based on the image
  const mockExamResults = [
    { id: 1, course: "Aile Danışmanlığı", examPeriod: "30.07.2025 - 31.07.2025" },
    { id: 2, course: "TEMEL İLK YARDIM EĞİTİMİ", examPeriod: "01.01.2025 - 19.01.2025" },
    { id: 3, course: "TEMEL İLK YARDIM EĞİTİMİ", examPeriod: "02.01.2025 - 20.01.2025" },
    { id: 4, course: "TEMEL İLK YARDIM EĞİTİMİ", examPeriod: "01.02.2025 - 10.02.2025" },
    { id: 5, course: "TEMEL İLK YARDIM EĞİTİMİ", examPeriod: "12.02.2025 - 13.02.2025" },
    { id: 6, course: "TEMEL İLK YARDIM EĞİTİMİ", examPeriod: "12.03.2025 - 13.03.2025" },
    { id: 7, course: "TEMEL İLK YARDIM EĞİTİMİ", examPeriod: "19.03.2025 - 20.03.2025" },
    { id: 8, course: "TEMEL İLK YARDIM EĞİTİMİ", examPeriod: "09.04.2025 - 10.04.2025" },
    { id: 9, course: "TEMEL İLK YARDIM EĞİTİMİ", examPeriod: "23.04.2025 - 24.04.2025" },
    { id: 10, course: "TEMEL İLK YARDIM EĞİTİMİ", examPeriod: "14.05.2025 - 15.05.2025" },
    { id: 11, course: "TEMEL İLK YARDIM EĞİTİMİ", examPeriod: "11.06.2025 - 12.06.2025" },
    { id: 12, course: "TEMEL İLK YARDIM EĞİTİMİ", examPeriod: "26.06.2025 - 26.06.2025" },
    { id: 13, course: "TEMEL İLK YARDIM EĞİTİMİ", examPeriod: "02.07.2025 - 03.07.2025" },
    { id: 14, course: "TEMEL İLK YARDIM EĞİTİMİ", examPeriod: "30.07.2025 - 31.07.2025" },
    { id: 15, course: "TEMEL İLK YARDIM EĞİTİMİ", examPeriod: "13.08.2025 - 14.08.2025" },
    { id: 16, course: "TEMEL İLK YARDIM EĞİTİMİ", examPeriod: "17.08.2025 - 22.08.2025" },
    { id: 17, course: "TEMEL İLK YARDIM EĞİTİMİ", examPeriod: "25.08.2025 - 31.08.2025" },
    { id: 18, course: "TEMEL İLK YARDIM EĞİTİMİ", examPeriod: "12.12.2025 - 12.12.2025" },
    { id: 19, course: "ECZANE YARDIMCILIĞI", examPeriod: "13.08.2025 - 14.08.2025" },
    { id: 20, course: "ECZANE YARDIMCILIĞI", examPeriod: "08.12.2025 - 12.12.2025" },
    { id: 21, course: "İLERİ SÜRÜŞ TEKNİKLERİ", examPeriod: "01.01.2025 - 05.01.2025" }
  ];

  const filteredResults = mockExamResults.filter(result =>
    result.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sınav Sonuç Raporu</h1>
        <p className="text-gray-600 text-sm">
          Güncellenemez olduğundan sınav tarihlerini kontrol ediniz.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Kurs ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-40"
              />
              <Button variant="outline">
                <Filter className="mr-2" size={16} />
                Filtrele
              </Button>
            </div>
            <Button className="bg-primary text-white">
              <Download className="mr-2" size={16} />
              Excel İndir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ClipboardList className="text-primary" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sınav Sonuçları</h2>
              <p className="text-sm text-gray-600">
                Toplam {filteredResults.length} sınav sonucu listeleniyor
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kurs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sınav Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">
                      <div className="animate-pulse">Yükleniyor...</div>
                    </td>
                  </tr>
                ) : filteredResults.length > 0 ? (
                  filteredResults.map((result, index) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {result.course}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.examPeriod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-primary hover:text-secondary"
                          >
                            Detay Görüntüle
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                          >
                            <Download className="mr-1" size={14} />
                            İndir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      <ClipboardList size={48} className="mx-auto mb-4 text-gray-400" />
                      <p>Henüz sınav sonucu bulunmuyor</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Toplam {filteredResults.length} sonuç
              </span>
              <div className="text-xs text-gray-500">
                2023 - 2025 © İsa - ALGI AKADEMİ
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}