import api from "../lib/axios";
import type { RegisterDTO } from "@/types/request/RegisterRequest";
import type { RegisterResponse } from "@/types/response/RegisterResponse";
import type { AuthResponse } from "@/types/response/AuthResponse";
import type { LoginDTO } from "@/types/request/LoginRequest";
import type { ForgotPasswordRequest } from "@/types/request/ForgotPasswordRequest";
import type { VerifyResetCodeRequest } from "@/types/request/VerifyResetCodeRequest";
import type { ResetPasswordRequest } from "@/types/request/ResetPasswordRequest";
import type { MessageResponse } from "@/types/response/MessageResponse";
import type { VerifyResetCodeResponse } from "@/types/response/VerifyResetCodeResponse";

export const registerUser = async (userData: RegisterDTO): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>("/auth/register", userData);
  return response.data;
};

export const loginUser = async (credentials: LoginDTO): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", credentials);
  return response.data;
};

export const refreshAccesToken = async (refreshToken: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/refreshSession", refreshToken);
  return response.data;
};

export const forgotPassword = async (payload: ForgotPasswordRequest): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>("/auth/forgot-password", payload);
  return response.data;
};

export const verifyResetCode = async (
  payload: VerifyResetCodeRequest
): Promise<VerifyResetCodeResponse> => {
  const response = await api.post<VerifyResetCodeResponse>("/auth/verify-reset-code", payload);
  return response.data;
};

export const resetPassword = async (payload: ResetPasswordRequest): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>("/auth/reset-password", payload);
  return response.data;
};
