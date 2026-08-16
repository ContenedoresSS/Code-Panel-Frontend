import api from "@/lib/axios";
import type { CreateActivityRequest } from "@/types/request/CreateActivityRequest";
import type { UpdateActivityRequest } from "@/types/request/UpdateActivityRequest";
import type { SubmitRequest } from "@/types/request/SubmitRequest";
import type { ActivityResponse } from "@/types/response/ActivityResponse";
import type { ActivitySummaryResponse } from "@/types/response/ActivitySummaryResponse";
import type { EvaluationResult } from "@/types/response/EvaluationResult";
import type { WorkspaceResponse } from "@/types/response/WorkspaceResponse";

interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
}

export const getActivitiesBySubject = async (
  subjectId: string | number
): Promise<ActivitySummaryResponse[]> => {
  const response = await api.get<PaginatedResponse<ActivitySummaryResponse>>("/activity");
  const allActivities = response.data.data;
  return allActivities.filter((activity) => activity.subjectId === Number(subjectId));
};

export const getActivitiesById = async (id: string): Promise<ActivityResponse> => {
  const response = await api.get<ActivityResponse>(`/activity/${id}`);
  return response.data;
};

export const createActivity = async (
  activityData: CreateActivityRequest
): Promise<ActivityResponse> => {
  const response = await api.post<ActivityResponse>("/activity", activityData);
  return response.data;
};

export const updateActivity = async (
  id: string,
  updateActivityData: UpdateActivityRequest
): Promise<ActivityResponse> => {
  const response = await api.put(`/activity/${id}`, updateActivityData);
  return response.data;
};

export const deleteActivity = async (id: string): Promise<void> => {
  await api.delete(`/activity/${id}`);
};

export const getWorkspace = async (id: string): Promise<WorkspaceResponse> => {
  const response = await api.get<WorkspaceResponse>(`/activity/${id}/workspace`);
  return response.data;
};

export const submitSolution = async (
  activityId: string,
  data: SubmitRequest
): Promise<EvaluationResult> => {
  const response = await api.post<EvaluationResult>(`/activity/${activityId}/submit`, data);
  return response.data;
};
