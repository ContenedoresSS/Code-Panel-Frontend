export interface TestCase {
  id: number;
  activityId: string;
  input: string | null;
  expectedOutput: string;
  isHidden: boolean;
}
