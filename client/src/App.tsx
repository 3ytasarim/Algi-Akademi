import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import Reports from "@/pages/reports";
import AddStudent from "@/pages/add-student";
import ExamResults from "@/pages/exam-results";
import Consultants from "@/pages/consultants";
import Integrations from "@/pages/integrations";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

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
              <Route path="/exam-results" component={ExamResults} />
              <Route path="/consultants" component={Consultants} />
              <Route path="/integrations" component={Integrations} />
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
