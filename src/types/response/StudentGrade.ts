import type { StudentSubmission } from "./StudentSubmission";

export interface StudentGrade {
  student: {
    id: string;
    name: string;
    lastName: string;
    email: string;
    identifier: string | null;
  };
  finalGrade: number | null;
  submissions: StudentSubmission[];
}
