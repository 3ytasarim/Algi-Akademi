import { useEffect } from "react";
import { useAuth } from "./useAuth";

export function useRoleSetup() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const pendingRole = localStorage.getItem('pendingRole');
      
      if (pendingRole && (!user.role || user.role !== pendingRole)) {
        // Set the role for the user using fetch directly
        fetch("/api/auth/set-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ role: pendingRole }),
        })
          .then((response) => {
            if (response.ok) {
              localStorage.removeItem('pendingRole');
              // Refresh the page to get updated user data
              window.location.reload();
            } else {
              throw new Error(`HTTP ${response.status}`);
            }
          })
          .catch((error) => {
            console.error("Failed to set user role:", error);
            localStorage.removeItem('pendingRole');
          });
      }
    }
  }, [isAuthenticated, user]);
}