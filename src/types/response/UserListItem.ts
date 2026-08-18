export interface UserRoleRef {
  id: number;
  name: string;
}

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  lastName: string;
  identifier: string | null;
  isActive: boolean;
  createdAt: string;
  role: UserRoleRef;
}

export interface PaginatedUserList {
  data: UserListItem[];
  totalCount: number;
}
