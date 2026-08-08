export interface UpdateLanguageRequest {
  name?: string;
  version?: string;
  dockerImage?: string;
  executionCommand?: string;
  fileExtension?: string;
  editorIdentifier?: string;
}
