
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { TokenService } from '@/service/TokenService';

export interface User {
  id: number;
  identifier: string;
  role: string;
  name:string;
}

interface AuthContextType {
  user: User | null; 
  isAuthenticated: boolean;               
  isLoading: boolean;                     
  loginState: (token: string, refreshToken: string) => void;
  logoutState: () => void;
}

// Creamos el contexto vacío
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. El Componente Proveedor (El que envuelve tu App)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkToken = () => {
    const userData = TokenService.getUserFromToken();
    setUser(userData);
    setIsLoading(false); 
  };

  useEffect(() => {
    checkToken();
  }, []);

  const loginState = (token: string, refreshToken: string) => {
      TokenService.setTokens(token, refreshToken);
      checkToken(); 
    };

  const logoutState = () => {
    TokenService.removeTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user,
      isLoading, 
      loginState, 
      logoutState 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};