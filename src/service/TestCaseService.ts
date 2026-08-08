import api from "@/lib/axios";
import type { TestCase } from "@/types/response/TestCase";
import type { CreateTestCaseRequest } from "@/types/request/CreateTestCaseRequest";
import type { UpdateTestCaseRequest } from "@/types/request/UpdateTestCaseRequest";

export const getTestCases = async (activityId: string): Promise<TestCase[]> => {
  const response = await api.get<TestCase[]>(`/activity/${activityId}/test-case`);
  return response.data;
};

export const createTestCase = async (
  activityId: string,
  data: CreateTestCaseRequest
): Promise<TestCase> => {
  const response = await api.post<TestCase>(`/activity/${activityId}/test-case`, data);
  return response.data;
};

export const updateTestCase = async (
  activityId: string,
  testCaseId: number,
  data: UpdateTestCaseRequest
): Promise<TestCase> => {
  const response = await api.put<TestCase>(`/activity/${activityId}/test-case/${testCaseId}`, data);
  return response.data;
};

export const deleteTestCase = async (
  activityId: string,
  testCaseId: number
): Promise<void> => {
  await api.delete(`/activity/${activityId}/test-case/${testCaseId}`);
};
