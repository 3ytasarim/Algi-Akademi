import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const menuItems = [
    {
      id: 'courses',
      title: 'Kurslarım',
      icon: BookOpen,
      isCollapsible: true,
      isOpen: coursesOpen,
      setOpen: setCoursesOpen,
      items: user?.assignedCategories || [
        'ADLİ SEKRETERLIK',
        'Aile Danışmanlığı', 
        'CİNSEL TERAPİ',
        'DİŞ HEKİMİ ASİSTANLIĞI',
        'ECZANE YARDIMCILIĞI',
        'Evlilik ve İlişki Danışmanlığı',
        'HASTA YAŞLI BAKIM',
        'İLERİ SÜRÜŞ TEKNİKLERİ',
        'TEMEL İLK YARDIM EĞİTİMİ',
        'TIBBİ SEKRETERLIK'
      ]
    },
    {
      id: 'exams', 
      title: 'Sınavlarım',
      icon: Award,
      isCollapsible: true,
      isOpen: examsOpen,
      setOpen: setExamsOpen,
      comingSoon: true,
      items: []
    },
    {
      id: 'personal',
      title: 'Kişisel İşlemler',
      icon: User,
      isCollapsible: true,
      isOpen: personalOpen,
      setOpen: setPersonalOpen,
      items: [
        { name: 'Kişisel Bilgilerim', path: '/student/profile' }
      ]
    }
  ];

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
        shadow-xl
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Eğitim Paneli</h2>
              <p className="text-sm text-gray-300">Öğrenci Portalı</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
              <User size={20} className="text-gray-300" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-gray-400">Öğrenci</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Dashboard Link */}
          <Link href="/student-dashboard">
            <Button
              variant="ghost"
              className={`w-full justify-start text-left h-auto p-3 rounded-lg ${
                location === '/student-dashboard' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Settings className="mr-3" size={20} />
              Dashboard
            </Button>
          </Link>

          {/* Menu Items */}
          {menuItems.map((item) => (
            <div key={item.id}>
              {item.isCollapsible ? (
                <div>
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-left h-auto p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => item.setOpen(!item.isOpen)}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3" size={20} />
                        {item.title}
                        {item.comingSoon && (
                          <Badge variant="secondary" className="ml-2 text-xs bg-yellow-600 text-white">
                            Yakında
                          </Badge>
                        )}
                      </div>
                      {item.isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </Button>
                  </div>
                  {item.isOpen && (
                    <div className="space-y-1 mt-2">
                    {item.id === 'courses' && item.items?.map((course: string) => (
                      <Link key={course} href={`/student/course/${encodeURIComponent(course)}`}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start text-left h-auto p-2 pl-12 rounded-lg text-sm ${
                            isActiveItem(`/student/course/${encodeURIComponent(course)}`)
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          <FileText className="mr-2" size={16} />
                          {course}
                        </Button>
                      </Link>
                    ))}
                    {item.id === 'personal' && item.items?.map((subItem: { name: string; path: string }) => (
                      <Link key={subItem.path} href={subItem.path}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start text-left h-auto p-2 pl-12 rounded-lg text-sm ${
                            isActiveItem(subItem.path)
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          <User className="mr-2" size={16} />
                          {subItem.name}
                        </Button>
                      </Link>
                    ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link href={`/student/${item.id}`}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-left h-auto p-3 rounded-lg ${
                      isActiveItem(`/student/${item.id}`)
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="mr-3" size={20} />
                    {item.title}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-left h-auto p-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300"
          >
            <LogOut className="mr-3" size={20} />
            Çıkış Yap
          </Button>
        </div>
      </div>
    </>
  );
}