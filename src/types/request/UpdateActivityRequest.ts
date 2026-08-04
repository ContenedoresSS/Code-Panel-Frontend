import type { CodeFile } from "../CodeFile";

export interface UpdateActivityRequest {
  title?: string;
  description?: string;
  languageId?: number;
  starterCode?: CodeFile[];
  maxAttempts?: number;
  allowCopy?: boolean;
  allowPaste?: boolean;
}
