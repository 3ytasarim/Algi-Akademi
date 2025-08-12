import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
// Note: Using custom collapsible implementation since @/components/ui/collapsible may not exist
import { 
  GraduationCap,
  BookOpen,
  FileText,
  User,
  ChevronDown,
  ChevronRight,
  Award,
  Settings,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface StudentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StudentSidebar({ isOpen, onClose }: StudentSidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [coursesOpen, setCoursesOpen] = useState(true);
  const [examsOpen, setExamsOpen] = useState(false);
  const [personalOpen, setPersonalOpen] = useState(false);

  // Fetch student courses from API
  const { data: courses = [] } = useQuery({
    queryKey: ["/api/student/courses"],
    retry: false,
  });

  const handleLogout = async () => {
    if (user?.isManualStudent) {
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
      window.location.href = "/api/logout";
    }
  };



  const isActiveItem = (path: string) => location === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-80 bg-gray-800 dark:bg-gray-900 text-white z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        shadow-2xl border-r border-gray-700/50
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-blue-600/10 to-indigo-600/10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap size={26} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Algı Akademi</h2>
              <p className="text-sm text-blue-200 font-medium">Öğrenci Portalı</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-700/50 bg-gray-800/50">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center ring-2 ring-blue-500/20">
              <User size={24} className="text-gray-200" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-lg">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-blue-300 font-medium">Aktif Öğrenci</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Dashboard Link */}
          <Link href="/student-dashboard">
            <Button
              variant="ghost"
              className={`w-full justify-start text-left h-auto p-4 rounded-xl transition-all duration-200 ${
                location === '/student-dashboard' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <Settings className="mr-3" size={20} />
              <span className="font-semibold">Ana Sayfa</span>
            </Button>
          </Link>

          {/* Courses Section */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between text-left h-auto p-4 rounded-xl text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200"
              onClick={() => setCoursesOpen(!coursesOpen)}
            >
              <div className="flex items-center">
                <BookOpen className="mr-3" size={20} />
                Kurslarım
              </div>
              {coursesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
            {coursesOpen && (
              <div className="space-y-1 mt-2">
                {Array.isArray(courses) && courses.length > 0 ? (
                  courses.map((course: any) => (
                    <Link key={course.id} href={`/student/course/${encodeURIComponent(course.title)}`}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start text-left h-auto p-3 pl-12 rounded-lg text-sm transition-all duration-200 ${
                          isActiveItem(`/student/course/${encodeURIComponent(course.title)}`)
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md'
                            : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                        }`}
                      >
                        <FileText className="mr-2" size={16} />
                        {course.title}
                      </Button>
                    </Link>
                  ))
                ) : (
                  <div className="p-3 pl-12 text-sm text-gray-500">
                    Henüz kurs atanmamış
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Exams Section */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between text-left h-auto p-4 rounded-xl text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200"
              onClick={() => setExamsOpen(!examsOpen)}
            >
              <div className="flex items-center">
                <Award className="mr-3" size={20} />
                Sınavlarım
                <Badge variant="secondary" className="ml-2 text-xs bg-yellow-600 text-white">
                  Yakında
                </Badge>
              </div>
              {examsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
            {examsOpen && (
              <div className="space-y-1 mt-2">
                <div className="p-3 pl-12 text-sm text-gray-500">
                  Henüz sınav bulunmuyor
                </div>
              </div>
            )}
          </div>

          {/* Personal Section */}
          <div>
            <Link href="/student/profile">
              <Button
                variant="ghost"
                className={`w-full justify-start text-left h-auto p-4 rounded-xl transition-all duration-200 ${
                  isActiveItem('/student/profile')
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <User className="mr-3" size={20} />
                <span className="font-semibold">Kişisel Bilgilerim</span>
              </Button>
            </Link>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700/50 bg-gray-800/30">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-left h-auto p-4 rounded-xl text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="mr-3" size={20} />
            <span className="font-semibold">Çıkış Yap</span>
          </Button>
        </div>
      </div>
    </>
  );
}