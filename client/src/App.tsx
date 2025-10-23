import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useRoleSetup } from "@/hooks/useRoleSetup";
import { ThemeProvider } from "@/contexts/ThemeContext";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import StudentProfile from "@/pages/student-profile";
import StudentCourse from "@/pages/student-course";
import StudentCourseDetails from "@/pages/student-course-details";
import Reports from "@/pages/reports";
import AddStudent from "@/pages/add-student";
import StudentList from "@/pages/student-list";
import Consultants from "@/pages/consultants";
import Integrations from "@/pages/integrations";
import SmsIntegration from "@/pages/integrations/sms";
import SmsTemplates from "@/pages/integrations/sms-templates";
import EmailIntegration from "@/pages/integrations/email";
import NotificationsPage from "@/pages/notifications";
import CoursesPage from "@/pages/courses";
import StudentStatistics from "@/pages/student-statistics";
import CostReport from "@/pages/cost-report";
import ExamsList from "@/pages/exams/index";
import NewExam from "@/pages/exams/new";
import EditExam from "@/pages/exams/edit";
import ExamResults from "@/pages/exams/results";
import StudentExam from "@/pages/student-exam";


function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  useRoleSetup(); // Setup role on authentication

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="*" component={Landing} />
        </>
      ) : (
        <>
          {/* Role-based routing */}
          {user?.role === 'student' ? (
            <>
              <Route path="/" component={StudentDashboard} />
              <Route path="/student-dashboard" component={StudentDashboard} />
              <Route path="/student/profile" component={StudentProfile} />
              <Route path="/student/course/:courseTitle" component={StudentCourseDetails} />
              <Route path="/student/exam/:examSlug" component={StudentExam} />
            </>
          ) : (
            <>
              {/* Admin routes */}
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/student-dashboard" component={StudentDashboard} />
              <Route path="/reports" component={Reports} />
              <Route path="/add-student" component={AddStudent} />
              <Route path="/student-list" component={StudentList} />
              <Route path="/exam-results" component={ExamResults} />
              <Route path="/consultants" component={Consultants} />
              <Route path="/integrations" component={Integrations} />
              <Route path="/integrations/sms" component={SmsIntegration} />
              <Route path="/integrations/sms-templates" component={SmsTemplates} />
              <Route path="/integrations/email" component={EmailIntegration} />
              <Route path="/notifications" component={NotificationsPage} />
              <Route path="/courses" component={CoursesPage} />
              <Route path="/student-statistics" component={StudentStatistics} />
              <Route path="/cost-report" component={CostReport} />
              <Route path="/exams" component={ExamsList} />
              <Route path="/exams/new" component={NewExam} />
              <Route path="/exams/:id/edit" component={EditExam} />
              <Route path="/exams/results" component={ExamResults} />
            </>
          )}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
