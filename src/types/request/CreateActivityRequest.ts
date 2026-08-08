import type { CodeFile } from "../CodeFile";

export interface ActivityRules {
  allowCopy?: boolean;
  allowPaste?: boolean;
  allowCodeEdit?: boolean;
  allowLanguageChange?: boolean;
  allowFileUpload?: boolean;
  allowFileDownload?: boolean;
}

export interface CreateActivityRequest {
  subjectId: number;
  languageId: number;
  title: string;
  description?: string;
  starterCode?: CodeFile[];
  maxAttempts?: number;
  rules?: ActivityRules;
}
