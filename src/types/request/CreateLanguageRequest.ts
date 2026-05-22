export interface CreateLanguageRequest {
  name: string;
  version: string;
  dockerImage: string;
  executionCommand: string;
  fileExtension: string;
}
