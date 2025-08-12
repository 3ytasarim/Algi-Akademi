import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { StudentSidebar } from "@/components/StudentSidebar";
import TopBar from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  FileText, 
  Download,
  Clock,
  Star,
  ArrowLeft,
  Play
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";

export default function StudentCourseDetails() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const params = useParams();
  const courseName = params.courseTitle ? decodeURIComponent(params.courseTitle) : '';
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Fetch course sections from backend
  const { data: courseData, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/student/course", courseName, "sections"],
    retry: false,
  });

  // Extract course and sections from API response
  const course = (courseData as any)?.course;
  const courseSections = (courseData as any)?.sections || [];

  const handleViewPdf = (material: any) => {
    if (material.url && material.url !== '#') {
      // Open PDF in new tab for viewing
      window.open(material.url, '_blank');
      toast({
        title: "PDF Açılıyor",
        description: `${material.title} yeni sekmede açılıyor...`,
      });
    } else {
      toast({
        title: "PDF Bulunamadı",
        description: "Bu bölüm için henüz PDF materyali yüklenmemiş. Admin panelden PDF eklenmelidir.",
        variant: "destructive"
      });
    }
  };

  if (isLoading || !isAuthenticated || coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900/20">
        <div className="glass-effect p-8 rounded-3xl bg-white/50 dark:bg-gray-800/50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-slate-600 dark:text-gray-300 font-medium mt-4">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
        <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black transition-all duration-300 lg:ml-80">
          <TopBar 
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            title="Kurs Bulunamadı"
            subtitle="Aradığınız kurs bulunamadı"
          />
          
          <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-white">
            <div className="text-center py-12">
              <BookOpen className="mx-auto text-slate-400 dark:text-gray-500 mb-4" size={48} />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Kurs Bulunamadı</h3>
              <p className="text-slate-600 dark:text-gray-300 mb-4">
                Aradığınız kurs bulunamadı veya bu kursa erişim izniniz yok.
              </p>
              <Link href="/student-dashboard">
                <Button className="glass-effect bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white">
                  <ArrowLeft className="mr-2" size={16} />
                  Geri Dön
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black transition-all duration-300 lg:ml-80">
        <TopBar 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={course?.title || courseName}
          subtitle="Kurs İçeriği ve Materyaller"
        />
        
        <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-white">
          <div className="space-y-6">
            {/* Back Navigation */}
            <Link href="/student-dashboard">
              <Button variant="outline" className="glass-effect bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/20">
                <ArrowLeft className="mr-2" size={16} />
                Öğrenci Paneline Dön
              </Button>
            </Link>

            {/* Course Header */}
            <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-800/50">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mr-4">
                        <BookOpen className="text-primary" size={24} />
                      </div>
                      <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                          {course.title}
                        </h1>
                        <p className="text-slate-600 dark:text-gray-300 text-lg">
                          {course.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {course.category}
                      </Badge>
                      <div className="flex items-center text-slate-600 dark:text-gray-300">
                        <Clock size={16} className="mr-1" />
                        <span className="text-sm">{course.duration} ders</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-800/50">
              <CardHeader>
                <CardTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center">
                  <FileText className="mr-3 text-primary" size={24} />
                  Kurs İçeriği
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {courseSections.length > 0 ? (
                  courseSections.map((section: any, index: number) => (
                    <Card key={index} className="glass-effect border-white/20 dark:border-gray-700/20 bg-white/30 dark:bg-gray-700/30">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {section.title}
                          </h3>
                          <Badge variant="outline" className="text-primary border-primary/30">
                            {section.materials?.length || 0} materyal
                          </Badge>
                        </div>
                        
                        {section.materials && section.materials.length > 0 ? (
                          <div className="space-y-3">
                            {section.materials.map((material: any, materialIndex: number) => (
                              <div 
                                key={materialIndex}
                                className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-600/30 rounded-xl border border-white/20 dark:border-gray-600/20 hover:bg-white/70 dark:hover:bg-gray-600/50 transition-all duration-200"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                                    <FileText size={20} className="text-red-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                      {material.title}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-gray-300">
                                      PDF Dökümanı
                                    </p>
                                  </div>
                                </div>
                                <Button 
                                  size="sm"
                                  onClick={() => handleViewPdf(material)}
                                  className="glass-effect bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white"
                                >
                                  <FileText className="mr-1" size={14} />
                                  Oku
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-500 dark:text-gray-400">
                            <FileText className="mx-auto mb-2" size={32} />
                            <p>Bu bölümde henüz materyal bulunmuyor</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto text-slate-400 dark:text-gray-500 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Kurs İçeriği Bulunamadı</h3>
                    <p className="text-slate-600 dark:text-gray-300">
                      Bu kurs için henüz içerik yüklenmemiş.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <FileText size={24} className="text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                    {courseSections.reduce((total: any, section: any) => total + (section.materials?.length || 0), 0)}
                  </h3>
                  <p className="text-slate-600 dark:text-gray-300 font-medium">Toplam Materyal</p>
                </CardContent>
              </Card>

              <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-500/20 dark:to-green-600/10">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <BookOpen size={24} className="text-green-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{courseSections.length}</h3>
                  <p className="text-slate-600 dark:text-gray-300 font-medium">Kurs Bölümü</p>
                </CardContent>
              </Card>

              <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-gradient-to-br from-orange-500/10 to-red-600/5 dark:from-orange-500/20 dark:to-red-600/10">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Clock size={24} className="text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{course.duration}</h3>
                  <p className="text-slate-600 dark:text-gray-300 font-medium">Toplam Saat</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}