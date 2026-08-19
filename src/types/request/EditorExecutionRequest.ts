import type { CodeFile } from "../CodeFile";

export interface EditorExecutionRequest {
  languageId: number;
  code: string;
  stdin?: string;
}

export interface RunCodeWithFilesRequest {
  languageId: number;
  files: CodeFile[];
  entryPoint: string;
  stdin?: string;
}
