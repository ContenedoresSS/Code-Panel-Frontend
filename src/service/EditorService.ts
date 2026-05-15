import type { EditorExecutionRequest } from "@/types/request/EditorExecutionRequest";
import api from "../lib/axios";
import type { EditorExecutionResponse } from "@/types/response/EditorExecutionResponse";

export const executionCode = async (
  payload: EditorExecutionRequest
): Promise<EditorExecutionResponse> => {
  const response = await api.post<EditorExecutionResponse>("execution/run", payload);
  return response.data;
};
