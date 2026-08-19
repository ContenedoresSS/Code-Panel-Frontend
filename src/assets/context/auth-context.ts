import { createContext } from "react";

export interface User {
  id: number;
  identifier: string;
  role: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginState: (token: string, refreshToken: string) => void;
  logoutState: () => void;
  updateUserName: (name: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
