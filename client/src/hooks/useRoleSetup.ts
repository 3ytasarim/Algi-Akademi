import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { apiRequest } from "@/lib/queryClient";

export function useRoleSetup() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const pendingRole = localStorage.getItem('pendingRole');
      
      if (pendingRole && (!user.role || user.role !== pendingRole)) {
        // Set the role for the user
        apiRequest("/api/auth/set-role", "POST", { role: pendingRole })
          .then(() => {
            localStorage.removeItem('pendingRole');
            // Refresh the page to get updated user data
            window.location.reload();
          })
          .catch((error) => {
            console.error("Failed to set user role:", error);
            localStorage.removeItem('pendingRole');
          });
      }
    }
  }, [isAuthenticated, user]);
}