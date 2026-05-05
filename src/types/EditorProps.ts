export interface EditorLenguage {
  id: string;
  name: string;
}

export interface EditorCodeFile {
  id: string;
  nameFile: string;
  code: string;
  lenguageId: string;
}

export interface EditorConfig {}

export interface EditorTestCase {}
