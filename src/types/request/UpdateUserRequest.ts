import type { UserRole } from "@/types/enum/UserRole";

export interface UpdateUserRequest {
  password?: string;
  isActive?: boolean;
  role?: UserRole;
}
