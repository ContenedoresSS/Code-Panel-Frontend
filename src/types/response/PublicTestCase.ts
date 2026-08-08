export interface PublicTestCase {
  id: number;
  isHidden: boolean;
  input?: string | null;
  expectedOutput?: string;
}
