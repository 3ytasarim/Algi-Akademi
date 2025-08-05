import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  // Check manual student auth first
  const { data: manualUser, isLoading: manualLoading, isError: manualError } = useQuery<User>({
    queryKey: ["/api/auth/manual-student"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Only try Replit auth if manual auth is not loading and failed
  const { data: replitUser, isLoading: replitLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !manualLoading && manualError,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Determine which user to use
  const user = manualUser || replitUser;
  const isLoading = manualLoading || (!manualError && replitLoading);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isManualStudent: !!manualUser,
  };
}
