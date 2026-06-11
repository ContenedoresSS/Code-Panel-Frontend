export interface ActivitySummaryResponse {
  id: string;
  professorId: string;
  languageId: number;
  subjectId: number;
  title: string;
  description: string | null;
  createdAt: Date;
}
