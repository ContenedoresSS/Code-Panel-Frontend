export interface EditorLanguage {
  id: number;
  monacoId: string;
  name: string;
  fileExtension: string;
}

export interface EditorFile {
  id: string;
  nameFile: string;
  code: string;
  languageId: number;
}
