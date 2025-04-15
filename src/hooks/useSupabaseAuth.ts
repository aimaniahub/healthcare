import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { syncUserToSupabase } from "../lib/api";

/**
 * Hook to sync Firebase auth state with Supabase
 */
export function useSupabaseAuth() {
  const { currentUser } = useAuth();

  useEffect(() => {
    const syncAuth = async () => {
      if (currentUser) {
        try {
          // Get user role from localStorage
          const role =
            localStorage.getItem(`user_role_${currentUser.uid}`) || "patient";

          // Sync user data to Supabase
          await syncUserToSupabase(
            currentUser.uid,
            currentUser.email || "",
            currentUser.displayName || "",
            role,
          );
        } catch (error) {
          console.error("Error syncing auth with Supabase:", error);
        }
      }
    };

    syncAuth();
  }, [currentUser]);

  return { currentUser };
}
