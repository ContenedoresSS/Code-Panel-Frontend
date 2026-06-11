import api from "@/lib/axios";
import type { CreateActivityRequest } from "@/types/request/CreateActivityRequest";
import type { UpdateActivityRequest } from "@/types/request/UpdateActivityRequest";
import type { ActivityResponse } from "@/types/response/ActivityResponse";
import type { ActivitySummaryResponse } from "@/types/response/ActivitySummaryResponse";

export const getActivitiesBySubject = async (
  subjectId: string | number
): Promise<ActivitySummaryResponse[]> => {
  const response = await api.get<any>(`/activity`);
  const allActivities: ActivitySummaryResponse[] = response.data.data || response.data;
  const filteredActivities = allActivities.filter(
    (activity) => activity.subjectId === Number(subjectId)
  );

  return filteredActivities;
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
