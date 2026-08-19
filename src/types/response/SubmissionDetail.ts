import type { CodeFile } from "@/types/CodeFile";
import type { SubmissionStatus } from "./EvaluationResult";

export interface SubmissionDetail {
  id: string;
  studentId: string;
  activityId: string;
  languageId: number;
  codeSnapshot: CodeFile[];
  finalGrade: number | null;
  passedTests: number;
  totalTests: number;
  executionTimeMs: number | null;
  status: SubmissionStatus;
  compilerOutput: string | null;
  submittedAt: string;
  /**
   * Nombre del lenguaje de programación. El backend aún no lo envía
   * (solo `languageId`); está preparado para un cambio futuro.
   */
  languageName?: string | null;
  /**
   * Salida estándar (stdout) del programa. El backend actual solo
   * envía `compilerOutput`; está preparado para un cambio futuro
   * en el que se guarde y envíe el stdout.
   */
  stdout?: string | null;
}
