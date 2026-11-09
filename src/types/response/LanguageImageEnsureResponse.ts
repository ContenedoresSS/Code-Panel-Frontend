export interface LanguageImageEnsureResponse {
  dockerImage: string;
  alreadyPresent: boolean;
  pulled: boolean;
}
