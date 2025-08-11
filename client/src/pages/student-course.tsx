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

    // Mock course sections data - in real app, fetch from API
    const mockSections: CourseSection[] = [
      {
        id: '1',
        title: 'Giriş ve Temel Kavramlar',
        description: 'Kursa giriş ve temel kavramların öğrenilmesi',
        duration: '45 dakika',
        completed: true,
        pdfUrl: '/assets/sample.pdf'
      },
      {
        id: '2', 
        title: 'Uygulama Temelleri',
        description: 'Pratik uygulamalar ve temel beceriler',
        duration: '60 dakika',
        completed: true,
        pdfUrl: '/assets/sample.pdf'
      },
      {
        id: '3',
        title: 'İleri Seviye Konular',
        description: 'Derinlemesine konular ve uzman bilgileri',
        duration: '90 dakika',
        completed: false,
        pdfUrl: '/assets/sample.pdf'
      },
      {
        id: '4',
        title: 'Sınav Hazırlığı',
        description: 'Sınava yönelik hazırlık ve pratik testler',
        duration: '30 dakika',
        completed: false,
        pdfUrl: '/assets/sample.pdf'
      },
      {
        id: '5',
        title: 'Sertifika Sınavı',
        description: 'Final sınavı ve sertifika kazanımı',
        duration: '120 dakika',
        completed: false
      }
    ];

    setCourseSections(mockSections);
  }, []);

  const handleSectionClick = (section: CourseSection) => {
    if (section.pdfUrl) {
      // Open PDF in new tab
      window.open(section.pdfUrl, '_blank');
    } else {
      toast({
        title: "Bilgi",
        description: "Bu bölüm henüz mevcut değil.",
        variant: "default",
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
                Kurs İçeriği
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {courseSections.map((section, index) => (
                <div
                  key={section.id}
                  className={`glass-effect p-6 rounded-2xl border border-white/20 dark:border-gray-700/20 transition-all duration-300 cursor-pointer hover:shadow-lg bg-white/30 dark:bg-gray-700/30 ${
                    section.completed ? 'ring-2 ring-green-500/20' : ''
                  }`}
                  onClick={() => handleSectionClick(section)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        section.completed 
                          ? 'bg-green-500/20 text-green-600' 
                          : 'bg-gray-500/20 text-gray-500 dark:text-gray-400'
                      }`}>
                        {section.completed ? (
                          <CheckCircle size={24} />
                        ) : (
                          <span className="font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                          {section.title}
                        </h3>
                        <p className="text-slate-600 dark:text-gray-300 text-sm mb-3">
                          {section.description}
                        </p>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-slate-500 dark:text-gray-400">
                            <Clock size={16} className="mr-1" />
                            <span className="text-sm">{section.duration}</span>
                          </div>
                          {section.completed && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                              Tamamlandı
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {section.pdfUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="glass-effect"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSectionClick(section);
                          }}
                        >
                          <FileText className="mr-2" size={16} />
                          PDF
                        </Button>
                      )}
                      <Button
                        variant={section.completed ? "secondary" : "default"}
                        size="sm"
                        className="glass-effect"
                      >
                        {section.completed ? (
                          <>
                            <CheckCircle className="mr-2" size={16} />
                            Tekrar İzle
                          </>
                        ) : (
                          <>
                            <Play className="mr-2" size={16} />
                            Başla
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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