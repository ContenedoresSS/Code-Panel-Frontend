import type { CodeFile } from "../CodeFile";
import type { ActivityRulesResponse } from "./ActivityResponse";
import type { PublicTestCase } from "./PublicTestCase";

export interface WorkspaceLanguage {
  id: number;
  name: string;
  fileExtension: string;
}

export interface WorkspaceResponse {
  activityId: string;
  title: string;
  description: string | null;
  language: WorkspaceLanguage;
  starterCode: CodeFile[] | null;
  rules: ActivityRulesResponse;
  maxAttempts: number;
  testCases: PublicTestCase[];
}
