import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import LayoutWrapper from "@/components/LayoutWrapper";
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
  Link as LinkIcon
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

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

  // Countdown timer state - get course end date from user/student data
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Calculate countdown based on course end date
  useEffect(() => {
    // Mock course end date - in real app this would come from student data
    const courseEndDate = new Date('2025-12-31T23:59:59');
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = courseEndDate.getTime() - now;
      
      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Helper function to format time since activity
  const getTimeAgo = (dateString: string) => {
    const now = new Date().getTime();
    const activityTime = new Date(dateString).getTime();
    const diffInHours = Math.floor((now - activityTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Az önce";
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} gün önce`;
  };

  // Get activity icon based on type
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
    <LayoutWrapper title="Öğrenci Paneli" subtitle={`Hoşgeldin, ${user?.firstName}!`} activeHref="/student-dashboard">
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

          <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-500/20 dark:to-green-600/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
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
              {user?.lastLogin && (
                <div className="text-xs text-slate-500 dark:text-gray-400 border-t border-white/20 dark:border-gray-700/20 pt-3">
                  <div className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    Son Giriş: {new Date(user.lastLogin).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-gradient-to-br from-orange-500/10 to-red-600/5 dark:from-orange-500/20 dark:to-red-600/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-600 dark:text-gray-300 font-medium mb-1">Kurs Bitiş</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">Geri Sayım</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                  <Timer size={24} className="text-orange-600" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-900 dark:text-white animate-pulse">
                    {countdown.days}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-gray-300">Gün</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-900 dark:text-white animate-pulse">
                    {countdown.hours}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-gray-300">Saat</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-900 dark:text-white animate-pulse">
                    {countdown.minutes}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-gray-300">Dak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-900 dark:text-white animate-pulse">
                    {countdown.seconds}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-gray-300">San</div>
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
              {coursesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                  <p className="text-slate-600 dark:text-gray-300">Kurslar yükleniyor...</p>
                </div>
              ) : typedCourses.length > 0 ? (
                typedCourses.map((course) => (
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
                        <span className="text-slate-600 dark:text-gray-300">Bölüm Sayısı</span>
                        <span className="text-slate-900 dark:text-white font-bold">{course.duration || 0} bölüm</span>
                      </div>
                    </div>
                    <Link href={`/student/course/${encodeURIComponent(course.title)}`}>
                      <Button className="w-full glass-effect bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white font-medium">
                        <FileText className="mr-2" size={16} />
                        Kurs İçeriğini Gör
                      </Button>
                    </Link>
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

        {/* Quick Actions */}
        <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">
              Hızlı İşlemler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="glass-effect bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white p-6 h-auto flex flex-col items-center space-y-2 font-medium">
                <BookOpen size={24} />
                <span>Kurslara Git</span>
              </Button>
              <Button className="glass-effect bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500 hover:text-white p-6 h-auto flex flex-col items-center space-y-2 font-medium">
                <Award size={24} />
                <span>Sertifikalar</span>
              </Button>
              <Button className="glass-effect bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500 hover:text-white p-6 h-auto flex flex-col items-center space-y-2 font-medium">
                <FileText size={24} />
                <span>Ödevler</span>
              </Button>
              <Button className="glass-effect bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500 hover:text-white p-6 h-auto flex flex-col items-center space-y-2 font-medium">
                <Star size={24} />
                <span>Değerlendirme</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}