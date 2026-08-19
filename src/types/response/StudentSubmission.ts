import type { SubmissionStatus } from "./EvaluationResult";

export interface StudentSubmission {
  id: string;
  finalGrade: number | null;
  passedTests: number;
  totalTests: number;
  executionTimeMs: number | null;
  status: SubmissionStatus;
  submittedAt: string;
}
