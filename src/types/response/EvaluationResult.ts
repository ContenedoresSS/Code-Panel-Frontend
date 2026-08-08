export type SubmissionStatus =
  | "PENDING"
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "COMPILE_ERROR"
  | "RUNTIME_ERROR";

export interface EvaluationResult {
  status: SubmissionStatus;
  finalGrade: number;
  passedTests: number;
  totalTests: number;
  executionTimeMs: number;
  compilerOutput: string | null;
  languageId: number;
}
