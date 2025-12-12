// contexts/UserContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getAuthSupabase, supabase } from "../supabase";

export type Profile = {
  id: string;
  name: string;
  role: "admin" | "cashier";
  pin?: string | null;
};

type UserContextType = {
  user: Profile | null;
  isLoading: boolean;
  authenticatedSupabase: any; // For authenticated operations
  signIn: (profile: Profile) => void;
  signOut: () => void;
  isAdmin: () => boolean;
  isCashier: () => boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authClient, setAuthClient] = useState<any>(null);

  const signIn = (profile: Profile) => {
    setUser(profile);
    // Create authenticated supabase client for this user
    const authSupabase = getAuthSupabase(profile.id);
    setAuthClient(authSupabase);
    AsyncStorage.setItem("userProfile", JSON.stringify(profile));
  };

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("userProfile");
        if (storedUser) {
          const profile = JSON.parse(storedUser);
          setUser(profile);
          setAuthClient(getAuthSupabase(profile.id));
        }
      } catch (err) {
        console.log("Error loading stored user:", err);
      }
    };

    loadStoredUser();
  }, []);

  const signOut = () => {
    setUser(null);
    setAuthClient(null);
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const isCashier = () => {
    return user?.role === "cashier";
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        authenticatedSupabase: authClient || supabase,
        signIn,
        signOut,
        isAdmin,
        isCashier,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
