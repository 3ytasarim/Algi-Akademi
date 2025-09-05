import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { StudentSidebar } from "@/components/StudentSidebar";
import TopBar from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Award, 
  Timer, 
  Clock,
  Play,
  CheckCircle,
  Star,
  FileText,
  Link as LinkIcon,
  Calendar
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function StudentDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Countdown timer state
  const [countdown, setCountdown] = useState({
    days: 365,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Countdown timer effect - using real student end date
  useEffect(() => {
    if (!user?.bitişTarihi) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const targetDate = new Date(user.bitişTarihi).getTime();
      const distance = targetDate - now;
      
      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        setCountdown({ days, hours, minutes, seconds });
      } else {
        // Course expired
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [user?.bitişTarihi]);

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

  // Fetch student courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/student/courses"],
    retry: false,
  });

  // Fetch student activities  
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/student/activities"], 
    retry: false,
  });

  // Type assertion for courses since we know the structure from the API
  const typedCourses = courses as Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    duration: number;
  }>;

  // Type assertion for activities
  const typedActivities = activities as Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
    entityType: string;
  }>;

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    return activityDate.toLocaleDateString('tr-TR');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'course_completed':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'course_assigned':
        return <BookOpen size={20} className="text-blue-600" />;
      case 'course_progress':
        return <Timer size={20} className="text-orange-600" />;
      case 'assignment_assigned':
        return <FileText size={20} className="text-blue-600" />;
      case 'certificate_earned':
        return <Award size={20} className="text-yellow-600" />;
      case 'system_notification':
        return <CheckCircle size={20} className="text-green-600" />;
      default:
        return <Clock size={20} className="text-gray-600" />;
    }
  };

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

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      <StudentSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebarCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
        <TopBar 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title="Öğrenci Paneli"
          subtitle=""
        />
        
        {/* Page Content */}
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black flex flex-col">
          <div className="flex-1 container mx-auto px-4 py-8 text-gray-900 dark:text-white">
          <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-800/50">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white">{typedCourses.length}</h3>
                      <p className="text-slate-600 dark:text-gray-300 font-medium">Kayıtlı Kurslarım</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                      <BookOpen size={24} className="text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-500/20 dark:to-green-600/10 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mr-3 animate-pulse">
                          <Clock size={20} className="text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          Son Giriş Tarih ve Zaman
                        </h3>
                      </div>
                      {user?.lastLogin ? (
                        <div className="animate-fade-in">
                          <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                            {new Date(user.lastLogin).toLocaleDateString('tr-TR', {
                              day: '2-digit',
                              month: '2-digit', 
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-lg font-semibold text-green-600 dark:text-green-400 animate-pulse">
                            {new Date(user.lastLogin).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </p>
                        </div>
                      ) : (
                        <div className="animate-bounce">
                          <p className="text-2xl font-black text-slate-700 dark:text-gray-300 mb-1">
                            --.--.----
                          </p>
                          <p className="text-lg font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
                            --:--:--
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mb-1"></div>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">Aktif</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Third Card - Course Count and Remaining Days */}
              <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mr-3 animate-pulse">
                          <Calendar size={20} className="text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          Kalan Gün
                        </h3>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 text-2xl font-bold text-slate-900 dark:text-white mb-3">
                          <span className="transition-all duration-300 ease-in-out hover:scale-105 hover:text-purple-600">
                            {countdown.days}
                          </span>
                          <span className="text-lg text-purple-600 dark:text-purple-400">Gün</span>
                          
                          <span className="transition-all duration-300 ease-in-out hover:scale-105 hover:text-purple-600">
                            {countdown.hours.toString().padStart(2, '0')}
                          </span>
                          <span className="text-lg text-purple-600 dark:text-purple-400">Saat</span>
                          
                          <span className="transition-all duration-300 ease-in-out hover:scale-105 hover:text-purple-600">
                            {countdown.minutes.toString().padStart(2, '0')}
                          </span>
                          <span className="text-lg text-purple-600 dark:text-purple-400">Dakika</span>
                          
                          <span className="transition-all duration-500 ease-in-out transform hover:scale-110 hover:text-purple-600 animate-pulse">
                            {countdown.seconds.toString().padStart(2, '0')}
                          </span>
                          <span className="text-lg text-purple-600 dark:text-purple-400">Saniye</span>
                        </div>
                        
                        <div className="flex items-center justify-center space-x-2 mt-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">Aktif</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* My Courses */}
              <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-800/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center">
                    <BookOpen className="mr-3 text-primary" size={24} />
                    Kurslarım
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {coursesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                      <p className="text-slate-600 dark:text-gray-300">Kurslar yükleniyor...</p>
                    </div>
                  ) : typedCourses.length > 0 ? (
                    <div className="space-y-4">
                      {typedCourses.map((course) => (
                        <div key={course.id} className="p-4 glass-effect rounded-2xl border border-white/20 dark:border-gray-700/20 bg-white/30 dark:bg-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                              {course.title}
                            </h3>
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {course.category}
                            </Badge>
                          </div>
                          <p className="text-slate-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                            {course.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-slate-500 dark:text-gray-400 text-sm">
                              <Clock size={14} className="mr-1" />
                              <span>{course.duration} ders</span>
                            </div>
                            <Link href={`/student/course/${encodeURIComponent(course.title)}`}>
                              <Button size="sm" className="glass-effect bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white">
                                <FileText className="mr-1" size={14} />
                                Kurs İçeriğini Gör
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
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
                  {activitiesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                      <p className="text-slate-600 dark:text-gray-300">Aktiviteler yükleniyor...</p>
                    </div>
                  ) : typedActivities.length > 0 ? (
                    <div className="space-y-4">
                      {typedActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-4 p-4 glass-effect rounded-2xl border border-white/20 dark:border-gray-700/20 bg-white/30 dark:bg-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200">
                          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-900 dark:text-white font-bold">
                              {activity.description.split(':')[0]}
                            </p>
                            {activity.description.includes(':') && (
                              <p className="text-slate-600 dark:text-gray-300 text-sm">
                                {activity.description.split(':')[1]?.trim()}
                              </p>
                            )}
                            <p className="text-slate-500 dark:text-gray-400 text-xs">
                              {getTimeAgo(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="mx-auto text-slate-400 dark:text-gray-500 mb-4" size={48} />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Henüz Aktivite Yok</h3>
                      <p className="text-slate-600 dark:text-gray-300">
                        Kurslarda ilerleme kaydedin, aktiviteleriniz burada görünecek.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div className="mb-2 sm:mb-0">
                  © 2024 Algı Akademi. Tüm hakları saklıdır.
                </div>
                <div className="flex items-center space-x-2">
                  <span>Design by</span>
                  <a 
                    href="https://www.3ytasarim.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200 hover:underline"
                  >
                    3Y Tasarım Yazılım Hizmetleri
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}