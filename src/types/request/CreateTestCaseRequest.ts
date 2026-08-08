export interface CreateTestCaseRequest {
  input?: string | null;
  expectedOutput: string;
  isHidden?: boolean;
}
