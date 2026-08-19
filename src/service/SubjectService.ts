import api from "@/lib/axios";
import type { CreateSubjectRequest } from "@/types/request/CreateSubjectRequest";
import type { DuplicateSubjectRequest } from "@/types/request/DuplicateSubjectRequest";
import type { DuplicateSubjectResponse } from "@/types/response/DuplicateSubjectResponse";
import type { SubjectResponse } from "@/types/response/SubjectResponse";
import type { EnrolledStudent } from "@/types/response/EnrolledStudent";

interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
}
export const getSubjectsByUser = async (): Promise<SubjectResponse[]> => {
  const response = await api.get<PaginatedResponse<SubjectResponse>>("/subject");
  return response.data.data;
};

export const createSubject = async (
  subjectData: CreateSubjectRequest
): Promise<SubjectResponse> => {
  const response = await api.post<SubjectResponse>("/subject", subjectData);
  return response.data;
};

export const deleteSubject = async (id: number | string): Promise<void> => {
  await api.delete(`/subject/${id}`);
};

export const updateSuject = async (
  id: number,
  subjecData: CreateSubjectRequest
): Promise<SubjectResponse> => {
  const response = await api.put<SubjectResponse>(`/subject/${id}`, subjecData);
  return response.data;
};

export const getSubjectById = async (id: number): Promise<SubjectResponse> => {
  const response = await api.get<SubjectResponse>(`/subject/${id}`);
  return response.data;
};

export const duplicateSubject = async (
  id: number,
  subjectData?: DuplicateSubjectRequest
): Promise<DuplicateSubjectResponse> => {
  const response = await api.post<DuplicateSubjectResponse>(
    `/subject/${id}/duplicate`,
    subjectData
  );
  return response.data;
};

export const getSubjectStudents = async (
  subjectId: number,
  params?: { skip?: number; take?: number; search?: string }
): Promise<PaginatedResponse<EnrolledStudent>> => {
  const response = await api.get<PaginatedResponse<EnrolledStudent>>(
    `/subject/${subjectId}/students`,
    {
      params: {
        skip: params?.skip ?? 0,
        take: params?.take ?? 100,
        ...(params?.search ? { search: params.search } : {}),
      },
    }
  );
  return response.data;
};
