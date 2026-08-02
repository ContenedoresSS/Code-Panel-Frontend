import type { CodeFile } from "../CodeFile";

export interface ActivityResponse {
  id: string;
  professorId: string;
  subjectId: number;
  languageId: number;
  title: string;
  description: string | null;
  starterCode: CodeFile[] | null;
  maxAttempts: number;
  allowCopy: boolean;
  allowPaste: boolean;
  createdAt: Date;
}
