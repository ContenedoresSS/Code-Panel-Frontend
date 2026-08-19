import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error.util";

const ACCES_TOKEN = "accesToken";
const REFRESH_TOKEN = "refreshToken";

export interface DecodedToken {
  id: number;
  identifier: string;
  role: string;
  exp: number;
  name: string;
}

export const TokenService = {
  getAccesToken: (): string | null => {
    return localStorage.getItem(ACCES_TOKEN);
  },
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN);
  },

  setTokens: (accesToken: string, refreshToken: string): void => {
    localStorage.setItem(ACCES_TOKEN, accesToken);
    localStorage.setItem(REFRESH_TOKEN, refreshToken);
  },

  removeTokens: (): void => {
    localStorage.removeItem(ACCES_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
  },

  getUserFromToken: () => {
    const currentToken = TokenService.getAccesToken();
    if (!currentToken) return null;

    try {
      const tokenDecode = jwtDecode<DecodedToken>(currentToken);
      const currenTime = Date.now() / 1000;

      if (tokenDecode.exp < currenTime) {
        toast.error("El token ha expirado");
        TokenService.removeTokens();
        return null;
      }

      return {
        id: tokenDecode.id,
        identifier: tokenDecode.identifier,
        role: tokenDecode.role,
        name: tokenDecode.name,
      };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "");
      toast.error("token invalido", { description: errorMessage || undefined });
      TokenService.removeTokens();
      return null;
    }
  },
};
