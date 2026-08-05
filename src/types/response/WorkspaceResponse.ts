import type { CodeFile } from "../CodeFile";

export interface WorkspaceLanguage {
  id: number;
  name: string;
  editorIdentifier: string;
  fileExtension: string;
}

export interface WorkspaceResponse {
  title: string;
  description: string | null;
  language: WorkspaceLanguage;
  starterCode: CodeFile[] | null;
  allowCopy: boolean;
  allowPaste: boolean;
  allowEdit: boolean;
  allowLanguageChange: boolean;
  allowUpload: boolean;
  allowDownload: boolean;
  maxAttempts: number;
}
