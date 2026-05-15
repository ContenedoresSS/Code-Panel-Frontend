
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { TokenService } from '@/service/TokenService';

// 1. ¿Qué forma tiene la información "escondida" en tu token?
// Asegúrate de que los nombres (id, identifier, role) coincidan con lo que manda tu backend
export interface DecodedToken {
  id: number | string;
  identifier: string;
  role: string; 
  exp: number; 
}

// 2. ¿Qué datos y funciones vamos a compartir con toda la app?
interface AuthContextType {
  user: Omit<DecodedToken, 'exp'> | null; // El usuario (sin la fecha de expiración)
  isAuthenticated: boolean;               // True si hay sesión, False si no
  isLoading: boolean;                     // Para evitar parpadeos mientras lee el token
  loginState: (token: string, refreshToken: string) => void;
  logoutState: () => void;
}

// Creamos el contexto vacío
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. El Componente Proveedor (El que envuelve tu App)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [isLoading, setIsLoading] = useState(true); // Arranca en true para que la app espere

  // Función interna para leer y validar el token actual
  const checkToken = () => {
    const token = TokenService.getAccesToken();
    
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        
        // Verificamos si el token ya expiró (exp viene en segundos, Date.now en milisegundos)
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          throw new Error("El token ha expirado");
        }

        // Si todo está bien, guardamos al usuario en la memoria de React
        setUser({ 
          id: decoded.id, 
          identifier: decoded.identifier, 
          role: decoded.role 
        });
      } catch (error) {
        console.error("Token inválido o expirado", error);
        TokenService.removeTokens(); // Limpiamos la basura
        setUser(null);
      }
    } else {
      setUser(null); // No hay token
    }
    setIsLoading(false); // Terminamos de cargar
  };

  // Se ejecuta una sola vez al cargar la página (F5)
  useEffect(() => {
    checkToken();
  }, []);

  // Función que llamaremos desde LoginForm al iniciar sesión con éxito
  const loginState = (token: string, refreshToken: string) => {
    TokenService.setTokens(token, refreshToken);
    checkToken(); // Forzamos a que lea el nuevo token
  };

  // Función que llamaremos desde el botón "Cerrar Sesión" o el Interceptor
  const logoutState = () => {
    TokenService.removeTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, // Truco de JS: convierte el objeto a true o false
      isLoading, 
      loginState, 
      logoutState 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Hook personalizado para no tener que importar useContext a cada rato
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};