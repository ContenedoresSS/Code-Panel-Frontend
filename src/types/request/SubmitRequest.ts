import type { CodeFile } from "../CodeFile";

export interface SubmitRequest {
  files: CodeFile[];
  languageId?: number;
}
