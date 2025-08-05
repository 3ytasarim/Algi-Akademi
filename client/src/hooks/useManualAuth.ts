import { useQuery } from "@tanstack/react-query";

export function useManualAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/manual-student"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}