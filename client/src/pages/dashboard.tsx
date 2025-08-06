import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Clock,
  Activity,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import LayoutWrapper from "@/components/LayoutWrapper";
import StatsCard from "@/components/ui/stats-card";
import CourseTable from "@/components/course-table";
import StudentTable from "@/components/student-table";

export default function Dashboard() {
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

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  // Fetch recent activities
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <LayoutWrapper title="Dashboard" subtitle="Sistem durumu ve genel bakış" activeHref="/">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard
            title="Toplam Kayıt"
            value={`${(stats as any)?.totalStudents || 0}`}
            change="+12%"
            icon={Users}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatsCard
            title="Toplam Kursiyer"
            value={`${(stats as any)?.totalEnrollments || 0}`}
            change="+8%"
            icon={BookOpen}
            gradient="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatsCard
            title="Farklı Kurs"
            value={`${(stats as any)?.activeCourses || 0}`}
            change="+5%"
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          />
        </div>

        {/* Course and Student Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CourseTable />
          <StudentTable />
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Son Aktiviteler</h3>
              <Activity className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            {activitiesLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activities && (activities as any).length > 0 ? (
              <div className="space-y-4">
                {(activities as any).slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(activity.createdAt).toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Henüz aktivite bulunmuyor</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}