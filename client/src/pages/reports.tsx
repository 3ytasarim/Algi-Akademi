import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calendar,
  Download,
  TrendingUp,
  BarChart3,
  Filter,
  Search
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Reports() {
  const [dateFilter, setDateFilter] = useState({
    startDate: "2025-01-01",
    endDate: "2025-07-31"
  });

  // Fetch sales data
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ["/api/sales"],
    retry: false,
  });

  // Fetch consultant data
  const { data: consultants, isLoading: consultantsLoading } = useQuery({
    queryKey: ["/api/consultants"],
    retry: false,
  });

  const mockSalesData = [
    { id: 1, date: "08.07.2025", course: "İŞ SAĞLIĞI VE GÜVENLİĞİ", sales: 2, amount: "30.000,00₺" },
    { id: 2, date: "08.07.2025", course: "AÇILIK", sales: 1, amount: "7.500,00₺" },
    { id: 3, date: "16.07.2025", course: "HUKUK", sales: 2, amount: "5.000,00₺" },
    { id: 4, date: "08.07.2025", course: "CİNSEL TERAPİ", sales: 1, amount: "2.000,00₺" },
    { id: 5, date: "08.07.2025", course: "HAYVAN YETİŞTİRİCİLİĞİ", sales: 1, amount: "3.000,00₺" },
    { id: 6, date: "26.07.2025", course: "HASTA KAYIT KABUL", sales: 1, amount: "3.000,00₺" },
    { id: 7, date: "26.07.2025", course: "BİLGİSAYARLI MUHASEBE", sales: 1, amount: "2.500,00₺" },
    { id: 8, date: "26.07.2025", course: "TIBBI SEKRETERLİK", sales: 1, amount: "3.000,00₺" },
  ];

  const mockConsultantData = [
    { id: 1, name: "SAFİYE HANIM", sales: "26.500,00₺", collection: "0,00₺" }
  ];

  const totalSales = mockSalesData.reduce((sum, item) => sum + parseInt(item.amount.replace(/[^\d]/g, '')), 0);
  const totalCollection = 26500;
  const remainingAmount = 19000;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
          <p className="text-gray-600">Satış ve tahsilat raporları</p>
        </div>
        <div className="flex items-center space-x-4">
          <Input
            type="date"
            value={dateFilter.startDate}
            onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
            className="w-40"
          />
          <span className="text-gray-500">-</span>
          <Input
            type="date"
            value={dateFilter.endDate}
            onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
            className="w-40"
          />
          <Button className="bg-primary text-white">
            <Filter className="mr-2" size={16} />
            Filtrele
          </Button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Course Sales Report */}
        <Card>
          <CardHeader className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Kurs Satış Raporu</h2>
              <Button variant="outline" size="sm">
                <Download className="mr-2" size={16} />
                Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kayıt Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kurs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Satış Sayısı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kurs Ücreti
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockSalesData.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.course}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.sales}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={2} className="px-6 py-3 text-right font-bold text-gray-900">
                      GENEL TOPLAM
                    </td>
                    <td className="px-6 py-3 font-bold text-gray-900">
                      {mockSalesData.reduce((sum, item) => sum + item.sales, 0)}
                    </td>
                    <td className="px-6 py-3 font-bold text-gray-900">
                      {totalSales.toLocaleString()},00₺
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right font-bold text-red-600">
                      HIZDIRIM TUTARI
                    </td>
                    <td className="px-6 py-3 font-bold text-red-600">
                      {remainingAmount.toLocaleString()},00₺
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right font-bold text-gray-900">
                      SATIŞ TUTARI
                    </td>
                    <td className="px-6 py-3 font-bold text-gray-900">
                      {totalCollection.toLocaleString()},00₺
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Consultant Sales Report */}
        <Card>
          <CardHeader className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Danışman Satış/Tahsilat Raporu</h2>
              <Button variant="outline" size="sm">
                <Download className="mr-2" size={16} />
                Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Danışman
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Satış Tutarı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tahsilat Tutarı
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockConsultantData.map((consultant) => (
                    <tr key={consultant.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {consultant.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {consultant.sales}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {consultant.collection}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-6 py-3 font-bold text-gray-900">
                      GENEL TOPLAM
                    </td>
                    <td className="px-6 py-3 font-bold text-gray-900">
                      26.500,00₺
                    </td>
                    <td className="px-6 py-3 font-bold text-gray-900">
                      0,00₺
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Statistics */}
      <Card>
        <CardHeader className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Kursiyer İstatistik</h2>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Ara..."
                className="w-64"
              />
              <Button variant="outline" size="sm">
                <Search className="mr-2" size={16} />
                Ara
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            01.07.2025 - 28.07.2025 tarihleri arasında 5 kursiyere 10 sertifika verilmiştir.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kayıt Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    T.C.K.N.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Adı Soyadı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Danışman
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kurs
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { date: "08.07.2025", tcno: "59350187244", name: "TAYFUN KAYMAZ", consultant: "SAFİYE HANIM", course: "AÇILIK" },
                  { date: "08.07.2025", tcno: "59350187244", name: "TAYFUN KAYMAZ", consultant: "SAFİYE HANIM", course: "CİNSEL TERAPİ" },
                  { date: "08.07.2025", tcno: "59350187244", name: "TAYFUN KAYMAZ", consultant: "SAFİYE HANIM", course: "HAYVAN YETİŞTİRİCİLİĞİ" },
                  { date: "08.07.2025", tcno: "11963612662", name: "DOĞAN UÇAN", consultant: "SAFİYE HANIM", course: "İŞ SAĞLIĞI VE GÜVENLİĞİ" },
                  { date: "16.07.2025", tcno: "14696643619", name: "KÜBRA ÖZDEMÍR", consultant: "SAFİYE HANIM", course: "HUKUK" },
                ].map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.tcno}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.consultant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.course}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}