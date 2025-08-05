import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Award, 
  TrendingUp, 
  Calendar,
  User,
  LogOut,
  Bell
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function StudentDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Yetkisiz Erişim",
        description: "Giriş yapmanız gerekiyor. Giriş sayfasına yönlendiriliyorsunuz...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch student enrollments
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/enrollments"],
    retry: false,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const studentEnrollments = enrollments?.filter((enrollment: any) => 
    enrollment.studentId === user?.id
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <BookOpen className="text-primary" size={32} />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Eğitim Paneli</h1>
              <p className="text-sm text-gray-600">Kurs/Kursiyer İşlemleri</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative p-2 text-gray-600 hover:text-gray-900">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                <img 
                  src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <span className="font-medium text-gray-900">
                {user?.firstName || 'Öğrenci'} {user?.lastName || ''}
              </span>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="mr-2" size={16} />
              Çıkış
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-teal-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{studentEnrollments.length}</h3>
                  <p className="text-teal-100">Kurs Kategorileri</p>
                </div>
                <BookOpen size={32} className="text-teal-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    {studentEnrollments.filter((e: any) => e.status === 'active').length}
                  </h3>
                  <p className="text-green-100">Kurslar</p>
                </div>
                <Award size={32} className="text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">0</h3>
                  <p className="text-orange-100">Ön Kayıtlar</p>
                  <p className="text-xs text-orange-200">6 başvuru</p>
                </div>
                <Calendar size={32} className="text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">317</h3>
                  <p className="text-red-100">Kursiyer</p>
                </div>
                <User size={32} className="text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Courses */}
        <Card className="mb-8">
          <CardHeader className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Kayıtlı Olduğum Kurslar</h2>
          </CardHeader>
          <CardContent className="p-6">
            {enrollmentsLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                      <div>
                        <div className="h-4 bg-gray-300 rounded mb-2 w-32"></div>
                        <div className="h-3 bg-gray-200 rounded mb-1 w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : studentEnrollments.length > 0 ? (
              <div className="space-y-4">
                {studentEnrollments.map((enrollment: any) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 gradient-primary rounded-lg flex items-center justify-center">
                        <BookOpen className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{enrollment.course?.title}</h3>
                        <p className="text-sm text-gray-600">
                          İlerleme: {enrollment.progress || 0}%
                        </p>
                        <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${enrollment.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        enrollment.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : enrollment.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {enrollment.status === 'active' ? 'Devam Ediyor' : 
                         enrollment.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                <p>Henüz kayıtlı olduğunuz kurs bulunmuyor</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}