
import { useState } from 'react';
import type { ReactNode } from 'react';
import { TokenService } from '@/service/TokenService';
import { AuthContext, type User } from './auth-context';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => TokenService.getUserFromToken());
  const [isLoading, setIsLoading] = useState(false);

  const checkToken = () => {
    const userData = TokenService.getUserFromToken();
    setUser(userData);
    setIsLoading(false);
  };

  const loginState = (token: string, refreshToken: string) => {
    TokenService.setTokens(token, refreshToken);
    checkToken();
  };

  const logoutState = () => {
    TokenService.removeTokens();
    setUser(null);
  };

  const updateUserName = (name: string) => {
    setUser((prev) => (prev ? { ...prev, name } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginState,
        logoutState,
        updateUserName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
