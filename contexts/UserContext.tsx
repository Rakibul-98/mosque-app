import React, { createContext, ReactNode, useContext, useState } from "react";

export type Profile = {
  id: string;
  name: string;
  role: "admin" | "cashier";
  pin?: string | null;
};

type UserContextType = {
  user: Profile | null;
  isLoading: boolean;
  signIn: (profile: Profile) => void;
  signOut: () => void;
  isAdmin: () => boolean;
  isCashier: () => boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = (profile: Profile) => {
    setUser(profile);
  };

  const signOut = () => {
    setUser(null);
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
