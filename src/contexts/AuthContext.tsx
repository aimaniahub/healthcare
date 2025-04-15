import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";
import { syncUserToSupabase } from "../lib/api";

type UserRole = "patient" | "healthcare" | "admin";

interface AuthUser extends User {
  role?: UserRole;
  displayName: string | null;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Get user role from localStorage or set default
        const userRole =
          (localStorage.getItem(`user_role_${user.uid}`) as UserRole) ||
          "patient";
        const authUser = user as AuthUser;
        authUser.role = userRole;
        setCurrentUser(authUser);

        // Sync user with Supabase
        syncUserToSupabase(
          user.uid,
          user.email || "",
          user.displayName || "",
          userRole,
        ).catch((error) => {
          console.error("Error syncing user to Supabase:", error);
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Set display name
    await updateProfile(result.user, {
      displayName: name,
    });

    // Store role in localStorage
    localStorage.setItem(`user_role_${result.user.uid}`, role);

    // Sync with Supabase
    await syncUserToSupabase(result.user.uid, email, name, role);

    // Update current user
    const authUser = result.user as AuthUser;
    authUser.role = role;
    setCurrentUser(authUser);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
