import api from "@/lib/axios";

export interface Enrollment {
  id: string;
  studentId: string;
  subjectId: number;
  createdAt: string;
}

export interface PaginatedEnrollmentsResponse {
  data: Enrollment[];
  totalCount: number;
}

export const getMyEnrollments = async (): Promise<PaginatedEnrollmentsResponse> => {
  const response = await api.get<PaginatedEnrollmentsResponse>("/enrollment", {
    params: { skip: 0, take: 100 },
  });
  return response.data;
};
