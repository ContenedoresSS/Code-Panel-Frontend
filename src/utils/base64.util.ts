import { logger } from "@/lib/logger";

export const encodeToBase64 = (text: string): string => {
  try {
    const bytes = new TextEncoder().encode(text);
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    return btoa(binString);
  } catch (error) {
    logger.error("Error codificando a Base64:", error);
    return "";
  }
};

export const decodeFromBase64 = (base64: string): string => {
  try {
    const binString = atob(base64);
    const bytes = Uint8Array.from(binString, (char) => char.codePointAt(0)!);
    return new TextDecoder().decode(bytes);
  } catch (error) {
    logger.error("Error decodificando de Base64:", error);
    return "";
  }
};
