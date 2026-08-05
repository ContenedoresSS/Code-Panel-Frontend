import type { CreateLanguageRequest } from "@/types/request/CreateLanguageRequest";
import type { UpdateLanguageRequest } from "@/types/request/UpdateLanguageRequest";
import type { LanguageResponse } from "@/types/response/LanguageResponse";
import api from "@/lib/axios";

export const createLanguage = async (
  languageData: CreateLanguageRequest
): Promise<LanguageResponse> => {
  const response = await api.post<LanguageResponse>("/programming-language", languageData);
  return response.data;
};

export const getAllLanguages = async (): Promise<LanguageResponse[]> => {
  const response = await api.get<LanguageResponse[]>("/programming-language");
  return response.data;
};

export const updateLanguage = async (
  id: number,
  languageData: UpdateLanguageRequest
): Promise<LanguageResponse> => {
  const response = await api.put<LanguageResponse>(`/programming-language/${id}`, languageData);
  return response.data;
};

export const deleteLanguage = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/programming-language/${id}`);
  return response.data;
};
