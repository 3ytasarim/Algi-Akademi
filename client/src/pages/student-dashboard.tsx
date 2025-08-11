import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Award, 
  TrendingUp, 
  Calendar,
  User,
  LogOut,
  Bell,
  Settings,
  Clock,
  Play,
  CheckCircle,
  Star,
  FileText,
  BarChart3
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

  // Fetch student courses (only enrolled courses)
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/student/courses"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900/20">
        <div className="glass-effect p-8 rounded-3xl bg-white/50 dark:bg-gray-800/50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-slate-600 dark:text-gray-300 font-medium mt-4">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Use all student courses since they're already filtered by enrollment
  const userCourses = courses || [];

  const handleLogout = async () => {
    if (user?.isManualStudent) {
      // Manual student logout
      try {
        await fetch('/api/auth/manual-logout', {
          method: 'POST',
          credentials: 'include',
        });
        window.location.href = window.location.origin;
      } catch (error) {
        console.error('Logout error:', error);
        window.location.href = window.location.origin;
      }
    } else {
      // Regular Replit logout
      window.location.href = "/api/logout";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900/20">
      {/* Header */}
      <header className="glass-effect border-b border-white/20 dark:border-gray-700/20 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="text-primary" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Öğrenci Paneli</h1>
                <p className="text-slate-600 dark:text-gray-300 font-medium">
                  Hoş geldin, {user?.firstName} {user?.lastName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="relative p-3 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50"
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="p-3 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50"
              >
                <Settings size={20} />
              </Button>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="glass-effect text-red-600 dark:text-red-400 border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium"
              >
                <LogOut className="mr-2" size={16} />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Card */}
        <Card className="glass-effect border-white/20 dark:border-gray-700/20 mb-8 bg-white/50 dark:bg-gray-800/50">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                  Merhaba, {user?.firstName}! 👋
                </h2>
                <p className="text-slate-600 dark:text-gray-300 text-lg">
                  Bugün öğrenmeye hazır mısın? Kurslarına devam et ve hedeflerine ulaş.
                </p>
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-lg">
                <Star className="text-primary" size={32} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">{(userCourses as any[]).length}</h3>
                  <p className="text-slate-600 dark:text-gray-300 font-medium">Kayıtlı Kurslarım</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                  <BookOpen size={24} className="text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-500/20 dark:to-green-600/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                    {user?.assignedCategories?.length || 0}
                  </h3>
                  <p className="text-slate-600 dark:text-gray-300 font-medium">Kategori</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                  <Award size={24} className="text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">%85</h3>
                  <p className="text-slate-600 dark:text-gray-300 font-medium">Ortalama İlerleme</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                  <TrendingUp size={24} className="text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Courses */}
          <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-800/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center">
                <BookOpen className="mr-3 text-primary" size={24} />
                Kurslarım
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(userCourses as any[]).length > 0 ? (
                (userCourses as any[]).map((course: any) => (
                  <div key={course.id} className="glass-effect p-6 rounded-2xl border border-white/20 dark:border-gray-700/20 hover:shadow-lg transition-all duration-300 bg-white/30 dark:bg-gray-700/30">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{course.title}</h3>
                        <p className="text-slate-600 dark:text-gray-300 text-sm mb-3">{course.description}</p>
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                          {course.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{course.price}₺</p>
                        <p className="text-slate-500 dark:text-gray-400 text-sm">{course.duration} saat</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600 dark:text-gray-300">İlerleme</span>
                        <span className="text-slate-900 dark:text-white font-bold">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <Button className="w-full glass-effect bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white font-medium">
                      <Play className="mr-2" size={16} />
                      Kursa Devam Et
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto text-slate-400 dark:text-gray-500 mb-4" size={48} />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Henüz Kurs Kaydın Yok</h3>
                  <p className="text-slate-600 dark:text-gray-300">
                    Kategorilerine göre kurslar otomatik olarak atanacak.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-800/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center">
                <Clock className="mr-3 text-primary" size={24} />
                Son Aktiviteler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 glass-effect rounded-2xl border border-white/20 dark:border-gray-700/20 bg-white/30 dark:bg-gray-700/30">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-white font-bold">Ders tamamlandı</p>
                    <p className="text-slate-600 dark:text-gray-300 text-sm">Web Tasarım - HTML Temelleri</p>
                    <p className="text-slate-500 dark:text-gray-400 text-xs">2 saat önce</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 glass-effect rounded-2xl border border-white/20 dark:border-gray-700/20 bg-white/30 dark:bg-gray-700/30">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <FileText size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-white font-bold">Yeni ödev atandı</p>
                    <p className="text-slate-600 dark:text-gray-300 text-sm">React Bileşenleri Projesi</p>
                    <p className="text-slate-500 dark:text-gray-400 text-xs">1 gün önce</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 glass-effect rounded-2xl border border-white/20 dark:border-gray-700/20 bg-white/30 dark:bg-gray-700/30">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <BarChart3 size={20} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-white font-bold">İlerleme raporu hazırlandı</p>
                    <p className="text-slate-600 dark:text-gray-300 text-sm">Aylık performans özeti</p>
                    <p className="text-slate-500 dark:text-gray-400 text-xs">3 gün önce</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass-effect border-white/20 dark:border-gray-700/20 mt-8 bg-white/50 dark:bg-gray-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 glass-effect border-white/20 dark:border-gray-700/20 hover:bg-primary/5 dark:hover:bg-primary/10 flex-col">
                <Calendar className="mb-2 text-primary" size={24} />
                <span className="text-slate-900 dark:text-white font-medium">Takvim</span>
              </Button>
              
              <Button variant="outline" className="h-20 glass-effect border-white/20 dark:border-gray-700/20 hover:bg-primary/5 dark:hover:bg-primary/10 flex-col">
                <FileText className="mb-2 text-primary" size={24} />
                <span className="text-slate-900 dark:text-white font-medium">Ödevler</span>
              </Button>
              
              <Button variant="outline" className="h-20 glass-effect border-white/20 dark:border-gray-700/20 hover:bg-primary/5 dark:hover:bg-primary/10 flex-col">
                <Award className="mb-2 text-primary" size={24} />
                <span className="text-slate-900 dark:text-white font-medium">Sınavlar</span>
              </Button>
              
              <Button variant="outline" className="h-20 glass-effect border-white/20 dark:border-gray-700/20 hover:bg-primary/5 dark:hover:bg-primary/10 flex-col">
                <BarChart3 className="mb-2 text-primary" size={24} />
                <span className="text-slate-900 dark:text-white font-medium">Raporlar</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}