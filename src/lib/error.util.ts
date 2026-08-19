import type { AxiosError } from "axios";

export function getErrorStatus(error: unknown): number | undefined {
  return (error as AxiosError)?.response?.status;
}

export function getErrorMessage(error: unknown, fallback = "Ocurrió un error inesperado."): string {
  const axiosError = error as AxiosError<{ error?: string; message?: string }>;
  return (
    axiosError?.response?.data?.error ||
    axiosError?.response?.data?.message ||
    (error instanceof Error ? error.message : "") ||
    fallback
  );
}
