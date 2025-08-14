import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Menu,
  BookOpen,
  FileText,
  Play,
  Download,
  Clock,
  CheckCircle,
  Star
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface CourseSection {
  id: string;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  pdfUrl?: string;
}

export default function StudentCourse() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [courseSections, setCourseSections] = useState<CourseSection[]>([]);

  useEffect(() => {
    // Get course title from URL
    const path = window.location.pathname;
    const courseName = decodeURIComponent(path.split('/').pop() || '');
    setCourseTitle(courseName);
  }, []);

  // Fetch real course sections from API with cache busting
  const { data: courseData, isLoading: courseSectionsLoading, error: courseDataError } = useQuery({
    queryKey: ['/api/student/course', courseTitle, 'sections', Date.now()], // Cache busting with timestamp
    enabled: !!courseTitle,
    retry: false,
    staleTime: 0, // Always refetch
    cacheTime: 0, // Don't cache
  });

  // Log API response for debugging
  useEffect(() => {
    console.log("=== STUDENT COURSE API RESPONSE ===");
    console.log("Course Title:", courseTitle);
    console.log("Course Data:", courseData);
    console.log("Loading:", courseSectionsLoading);
    console.log("Error:", courseDataError);
  }, [courseData, courseSectionsLoading, courseDataError, courseTitle]);

  useEffect(() => {
    console.log("=== STUDENT COURSE DATA PROCESSING ===");
    console.log("Raw courseData:", courseData);
    
    if (courseData && 'sections' in courseData && Array.isArray((courseData as any).sections)) {
      // Convert API data to frontend format - REAL LESSONS
      const sections: CourseSection[] = ((courseData as any).sections as any[]).map((section: any, index: number) => {
        console.log(`Processing section ${index}:`, section);
        
        // Get PDF URL from materials or direct pdfUrl field
        let pdfUrl = null;
        if (section.materials && section.materials.length > 0) {
          pdfUrl = section.materials[0].url;
        } else if (section.pdfUrl) {
          pdfUrl = section.pdfUrl;
        }
        
        const processedSection = {
          id: `lesson_${index}`,
          title: section.name || section.title || `Ders ${index + 1}`, // Use lesson name/title directly
          description: `${section.name || section.title || `Ders ${index + 1}`} - Ders Materyali`, // Show lesson name with material info
          duration: '60 dakika',
          completed: false,
          pdfUrl: pdfUrl
        };
        
        console.log(`Processed section ${index}:`, processedSection);
        return processedSection;
      });
      
      console.log("Final processed lessons:", sections);
      setCourseSections(sections);
    } else {
      console.log("No sections found in courseData or sections is not an array");
      setCourseSections([]);
    }
  }, [courseData]);

  const handleSectionClick = (section: CourseSection) => {
    if (section.pdfUrl && section.pdfUrl !== '#') {
      // Open PDF in new tab for viewing
      window.open(section.pdfUrl, '_blank');
      toast({
        title: "PDF Başarı ile Açıldı",
        description: `${section.title} dersi yeni sekmede açılıyor...`,
      });
    } else {
      toast({
        title: "PDF Bulunamadı", 
        description: "Bu bölüm için henüz PDF materyali yüklenmemiş. Admin panelden PDF eklenmelidir.",
        variant: "destructive"
      });
    }
  };

  const getProgressPercentage = () => {
    const completedSections = courseSections.filter(section => section.completed).length;
    return Math.round((completedSections / courseSections.length) * 100);
  };

  const getTotalDuration = () => {
    return courseSections.reduce((total, section) => {
      const minutes = parseInt(section.duration.split(' ')[0]);
      return total + minutes;
    }, 0);
  };

  if (isLoading || !isAuthenticated || courseSectionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900/20">
        <div className="glass-effect p-8 rounded-3xl bg-white/50 dark:bg-gray-800/50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-slate-600 dark:text-gray-300 font-medium mt-4">Kurs içeriği yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900/20">
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-80 min-h-screen">
        {/* Header */}
        <header className="glass-effect border-b border-white/20 dark:border-gray-700/20 sticky top-0 z-40 backdrop-blur-xl">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden p-2"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={20} />
                </Button>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white">{courseTitle}</h1>
                  <p className="text-slate-600 dark:text-gray-300 font-medium">
                    Kurs içerikleri ve materyaller
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto px-6 py-8">
          {/* Course Overview */}
          <Card className="glass-effect border-white/20 dark:border-gray-700/20 mb-8 bg-white/50 dark:bg-gray-800/50">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                      <BookOpen className="text-primary" size={32} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                        {courseTitle}
                      </h2>
                      <div className="flex items-center space-x-4">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {courseSections.length} Bölüm
                        </Badge>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                          {getTotalDuration()} Dakika
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-gray-300 text-lg leading-relaxed">
                    Bu kurs, {courseTitle.toLowerCase()} alanında temel ve ileri seviye bilgileri kapsamaktadır. 
                    Sertifika almak için tüm bölümleri tamamlamanız gerekmektedir.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-600 dark:text-gray-300">İlerleme</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {getProgressPercentage()}%
                      </span>
                    </div>
                    <Progress value={getProgressPercentage()} className="h-3" />
                    <p className="text-sm text-slate-500 dark:text-gray-400 mt-2">
                      {courseSections.filter(s => s.completed).length} / {courseSections.length} bölüm tamamlandı
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Sections */}
          <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center">
                <FileText className="mr-3 text-primary" size={24} />
                Ders Sıralaması
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {courseSections.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Bu bölümde henüz materyal bulunmuyor</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Kurs: {courseTitle} - Lessons: {courseSectionsLoading ? "Yükleniyor..." : "Veri yok"}
                  </p>
                </div>
              ) : (
                courseSections.map((section, index) => (
                <div
                  key={section.id}
                  className="glass-effect p-6 rounded-2xl border border-white/20 dark:border-gray-700/20 bg-white/30 dark:bg-gray-700/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-primary font-black text-lg">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                          {section.title}
                        </h3>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-slate-500 dark:text-gray-400">
                            <FileText size={16} className="mr-1" />
                            <span className="text-sm">Ders Materyali</span>
                          </div>
                          {section.pdfUrl && section.pdfUrl !== '#' ? (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                              ✓ PDF Mevcut
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20">
                              ✗ PDF Yok
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        className={`font-bold px-6 ${
                          section.pdfUrl && section.pdfUrl !== '#' 
                            ? 'bg-primary hover:bg-primary/90 text-white' 
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        }`}
                        size="lg"
                        onClick={() => handleSectionClick(section)}
                        disabled={!section.pdfUrl || section.pdfUrl === '#'}
                      >
                        <FileText size={18} className="mr-2" />
                        PDF Oku
                      </Button>
                    </div>
                  </div>
                </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Certificate Section */}
          {getProgressPercentage() === 100 && (
            <Card className="glass-effect border-white/20 dark:border-gray-700/20 mt-8 bg-gradient-to-br from-yellow-500/10 to-orange-500/5">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Star className="text-yellow-600" size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
                  Tebrikler! Kursu Tamamladınız
                </h3>
                <p className="text-slate-600 dark:text-gray-300 mb-6">
                  Tüm bölümleri başarıyla tamamladınız. Artık sertifikanızı alabilirsiniz.
                </p>
                <Button className="glass-effect bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  <Download className="mr-2" size={16} />
                  Sertifikayı İndir
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}