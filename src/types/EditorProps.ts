export interface EditorLanguage {
  id: number;
  monacoId: string;
  name: string;
  fileExtension: string;
}

export interface EditorCodeFile {
  id: string;
  nameFile: string;
  code: string;
  languageId: number;
}

export interface EditorConfig {}

export interface EditorTestCase {}
