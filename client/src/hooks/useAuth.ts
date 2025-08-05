import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  // First, try manual student auth
  const { data: manualUser, isLoading: manualLoading, error: manualError } = useQuery<User>({
    queryKey: ["/api/auth/manual-student"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Only try Replit auth if manual auth completely failed (not just loading)
  const shouldTryReplit = !manualLoading && !!manualError && !manualUser;
  
  const { data: replitUser, isLoading: replitLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: shouldTryReplit,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Determine the final user and loading state
  const user = manualUser || replitUser;
  const isLoading = manualLoading || (shouldTryReplit && replitLoading);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isManualStudent: !!manualUser,
  };
}
