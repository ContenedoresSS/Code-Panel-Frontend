export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  lastName: string;
  identifier: string | null;
  createdAt: Date;
  role?: {
    id: number;
    name: string;
  };
}
