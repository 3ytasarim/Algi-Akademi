import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Palette, Database } from "lucide-react";

export default function CourseTable() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ["/api/courses"],
    retry: false,
  });

  const getIconForCourse = (title: string) => {
    if (title.toLowerCase().includes('web') || title.toLowerCase().includes('geliştirme')) {
      return Code;
    } else if (title.toLowerCase().includes('grafik') || title.toLowerCase().includes('tasarım')) {
      return Palette;
    } else if (title.toLowerCase().includes('veri') || title.toLowerCase().includes('analiz')) {
      return Database;
    }
    return Code;
  };

  return (
    <Card className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Son Eklenen Kurslar</h2>
          <Button variant="link" className="text-primary hover:text-secondary font-medium p-0">
            Tümünü Gör
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded mb-2 w-32"></div>
                      <div className="h-3 bg-gray-200 rounded mb-1 w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-300 rounded mb-1 w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : courses && (courses as any).length > 0 ? (
            (courses as any).slice(0, 3).map((course: any) => {
              const IconComponent = getIconForCourse(course.title);
              return (
                <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 gradient-primary rounded-lg flex items-center justify-center">
                      <IconComponent className="text-white text-xl" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{course.title}</h3>

                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Kursiyer sayısı belirleniyor</span>
                        <span className={`text-xs ${course.status === 'active' ? 'text-green-600' : 'text-orange-600'}`}>
                          {course.status === 'active' ? 'Aktif' : 'Başlıyor'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{course.price ? `₺${course.price}` : '₺0'}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{course.duration ? `${course.duration} Hafta` : 'Süre belirsiz'}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Henüz kurs bulunmuyor
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
