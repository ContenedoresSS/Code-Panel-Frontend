import type { CodeFile } from "../CodeFile";

export interface WorkspaceLanguage {
  id: number;
  name: string;
  editorIdentifier: string;
}

export interface WorkspaceResponse {
  title: string;
  description: string | null;
  language: WorkspaceLanguage;
  starterCode: CodeFile[] | null;
  allowCopy: boolean;
  allowPaste: boolean;
  maxAttempts: number;
}
