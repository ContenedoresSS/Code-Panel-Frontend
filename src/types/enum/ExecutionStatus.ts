export const ExecutionStatus = {
  SUCCESS: "SUCCESS",
  TIME_LIMIT_EXCEEDED: "TIME_LIMIT_EXCEEDED",
  RUNTIME_ERROR: "RUNTIME_ERROR",
  COMPILE_ERROR: "COMPILE_ERROR",
} as const;

export type ExecutionStatus = typeof ExecutionStatus[keyof typeof ExecutionStatus];
