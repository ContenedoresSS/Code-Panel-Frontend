import api from "@/lib/axios";
import type {
  CreateInvitationDTO,
  InvitationDTO,
  UpdateInvitationDTO,
} from "@/types/dto/InvitationDTO";

export interface PaginatedInvitationResponse {
  data: InvitationDTO[];
  totalCount: number;
}

export const getAllInvitations = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedInvitationResponse> => {
  const response = await api.get("/invitation", {
    params: { page, limit },
  });
  return response.data.data;
};

export const createInvitation = async (data: CreateInvitationDTO): Promise<InvitationDTO> => {
  const response = await api.post<InvitationDTO>("/invitation", data);
  return response.data;
};

export const updateInvitation = async (
  id: number,
  dataUpdate: UpdateInvitationDTO
): Promise<InvitationDTO> => {
  const response = await api.put<InvitationDTO>(`/invitation/${id}`, dataUpdate);
  return response.data;
};

export const deleteInvitation = async (id: number): Promise<void> => {
  await api.delete(`/invitation/${id}`);
};
