// contexts/UserContext.tsx
import React, { createContext, ReactNode, useContext, useState } from "react";

export type Profile = {
  id: string;
  name: string;
  role: "admin" | "cashier";
  pin?: string | null;
};

type UserContextType = {
  user: Profile | null;
  signIn: (profile: Profile) => void;
  signOut: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);

  const signIn = (profile: Profile) => setUser(profile);
  const signOut = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
