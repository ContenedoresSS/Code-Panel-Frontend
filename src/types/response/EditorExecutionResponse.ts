import type { ExecutionStatus } from "../enum/ExecutionStatus";

export interface EditorExecutionResponse {
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  timeMs: number;
}
