import api from "@/lib/axios";
import type { UserProfileResponse } from "@/types/response/UserProfileResponse";
import type { UpdateProfileRequest } from "@/types/request/UpdateProfileRequest";
import type { ChangePasswordRequest } from "@/types/request/ChangePasswordRequest";
import type { UserListItem, PaginatedUserList } from "@/types/response/UserListItem";
import type { UpdateUserRequest } from "@/types/request/UpdateUserRequest";

export const getProfile = async (): Promise<UserProfileResponse> => {
  const response = await api.get<{ success: boolean; data: UserProfileResponse }>("/user/profile");
  return response.data.data;
};

export const updateProfile = async (
  profileData: UpdateProfileRequest
): Promise<UserProfileResponse> => {
  const response = await api.patch<{ success: boolean; data: UserProfileResponse }>(
    "/user/profile",
    profileData
  );
  return response.data.data;
};

export const changePassword = async (
  passwordData: ChangePasswordRequest
): Promise<{ success: boolean; message: string }> => {
  const response = await api.patch<{ success: boolean; message: string }>(
    "/user/password",
    passwordData
  );
  return response.data;
};

export interface GetUsersParams {
  skip?: number;
  take?: number;
  role?: string;
  search?: string;
}

export const getUsers = async (params: GetUsersParams = {}): Promise<PaginatedUserList> => {
  const response = await api.get<PaginatedUserList>("/user", { params });
  return response.data;
};

export const updateUserAdmin = async (
  id: string,
  data: UpdateUserRequest
): Promise<UserListItem> => {
  const response = await api.patch<UserListItem>(`/user/${id}`, data);
  return response.data;
};
