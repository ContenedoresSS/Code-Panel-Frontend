import type { CodeFile } from "../CodeFile";

export interface UpdateActivityRequest {
  title?: string;
  description?: string;
  starterCode?: CodeFile[];
  maxAttempts?: number;
  allowCopy?: boolean;
  allowPaste?: boolean;
}
