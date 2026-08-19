import type { SubjectResponse } from "./SubjectResponse";

export interface DuplicateSubjectResponse {
  subject: SubjectResponse;
  activitiesCloned: number;
  testCasesCloned: number;
}
