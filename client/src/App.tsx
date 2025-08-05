import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useRoleSetup } from "@/hooks/useRoleSetup";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import Reports from "@/pages/reports";
import AddStudent from "@/pages/add-student";
import StudentList from "@/pages/student-list";
import ExamResults from "@/pages/exam-results";
import Consultants from "@/pages/consultants";
import Integrations from "@/pages/integrations";
import NotificationsPage from "@/pages/notifications";
import CoursesPage from "@/pages/courses";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  useRoleSetup(); // Setup role on authentication

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          {/* Role-based routing */}
          {user?.role === 'student' ? (
            <>
              <Route path="/" component={StudentDashboard} />
              <Route path="/student-dashboard" component={StudentDashboard} />
            </>
          ) : (
            <>
              {/* Admin routes */}
              <Route path="/" component={Dashboard} />
              <Route path="/student-dashboard" component={StudentDashboard} />
              <Route path="/reports" component={Reports} />
              <Route path="/add-student" component={AddStudent} />
              <Route path="/student-list" component={StudentList} />
              <Route path="/exam-results" component={ExamResults} />
              <Route path="/consultants" component={Consultants} />
              <Route path="/integrations" component={Integrations} />
              <Route path="/notifications" component={NotificationsPage} />
              <Route path="/courses" component={CoursesPage} />
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
