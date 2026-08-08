import type { CodeFile } from "../CodeFile";

export interface ActivityRulesResponse {
  allowCopy: boolean;
  allowPaste: boolean;
  allowCodeEdit: boolean;
  allowLanguageChange: boolean;
  allowFileUpload: boolean;
  allowFileDownload: boolean;
}

export interface ActivityResponse {
  id: string;
  professorId: string;
  subjectId: number;
  languageId: number;
  title: string;
  description: string | null;
  starterCode: CodeFile[] | null;
  maxAttempts: number;
  rules: ActivityRulesResponse;
  createdAt: Date;
}
