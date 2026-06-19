export interface InvitationDTO {
  id: number;
  code: string;
  roleId: number;
  isUsed: boolean;
  createdAt: Date | string;
  role?: {
    name: string;
  };
}

export interface CreateInvitationDTO {
  roleId: number;
}

export interface UpdateInvitationDTO {
  roleId?: number;
  isUsed?: boolean;
}
