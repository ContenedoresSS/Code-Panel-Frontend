import type { CodeFile } from "../CodeFile";

export interface CreateActivityRequest {
  subjectId: number;
  languageId: number;
  title: string;
  description?: string;
  starterCode?: CodeFile[];
  maxAttempts?: number;
  allowCopy?: boolean;
  allowPaste?: boolean;
  allowEdit?: boolean;
  allowLanguageChange?: boolean;
  allowUpload?: boolean;
  allowDownload?: boolean;
}
