import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { useState, useEffect, useMemo } from "react";

export function useAuth() {
  const queryClient = useQueryClient();
  const [localAuth, setLocalAuth] = useState<User | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [localInitialized, setLocalInitialized] = useState(false);

  // Check localStorage for client-side auth on mount
  useEffect(() => {
    console.log('useAuth: Checking localStorage...');
    const storedUser = localStorage.getItem('auth_user');
    const isAuthenticated = localStorage.getItem('auth_authenticated');
    
    console.log('useAuth: storedUser:', storedUser);
    console.log('useAuth: isAuthenticated:', isAuthenticated);
    
    if (storedUser && isAuthenticated === 'true') {
      try {
        const user = JSON.parse(storedUser);
        console.log('useAuth: Parsed user:', user);
        setLocalAuth(user);
      } catch (error) {
        console.log('useAuth: Error parsing stored user:', error);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_authenticated');
      }
    }
    setLocalLoading(false);
    setLocalInitialized(true);
  }, []);

  // Try backend auth only after local auth is checked
  const { data: backendUser, isLoading: backendLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: localInitialized, // Only run after local auth check
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        if (response.ok) {
          return response.json();
        }
        return null;
      } catch {
        return null;
      }
    }
  });

  // Compute final auth state
  const authState = useMemo(() => {
    const user = backendUser || localAuth;
    const isLoading = localLoading || backendLoading;
    
    return {
      user,
      isLoading,
      isAuthenticated: !!user,
      isManualStudent: !!user?.isManualStudent,
    };
  }, [backendUser, localAuth, localLoading, backendLoading]);

  const logout = () => {
    console.log('LOGOUT: Starting logout process...');
    
    // Clear ALL localStorage
    localStorage.clear();
    console.log('LOGOUT: localStorage completely cleared');
    
    // Clear local state immediately
    setLocalAuth(null);
    console.log('LOGOUT: Local auth state cleared');
    
    // Clear React Query cache completely
    queryClient.clear();
    console.log('LOGOUT: React Query cache cleared');
    
    // Force page replacement instead of redirect (prevents back button)
    console.log('LOGOUT: Redirecting to login...');
    window.location.replace('/');
  };

  return {
    ...authState,
    logout
  };
}
