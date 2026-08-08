import type { CodeFile } from "../CodeFile";
import type { ActivityRules } from "./CreateActivityRequest";

export interface UpdateActivityRequest {
  title?: string;
  description?: string;
  languageId?: number;
  starterCode?: CodeFile[];
  maxAttempts?: number;
  rules?: ActivityRules;
}
