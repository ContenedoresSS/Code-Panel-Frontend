import { CheckCircle, Eye, Send, AlertCircle, Plus } from "lucide-react";
import { Button } from "../ui/button";
import type { PublicTestCase } from "@/types/response/PublicTestCase";
import type { EvaluationResult } from "@/types/response/EvaluationResult";
import { decodeFromBase64 } from "@/utils/base64.util";
import { escapeHtml } from "@/utils/sanitize.util";

interface TestCasesPanelProps {
  testCases?: PublicTestCase[];
  evaluationResult?: EvaluationResult | null;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  maxAttempts?: number;
  attemptCount?: number;
  onAddTestCase?: () => void;
}

export function TestCasesPanel({
  testCases,
  evaluationResult,
  onSubmit,
  isSubmitting,
  maxAttempts,
  attemptCount,
  onAddTestCase,
}: TestCasesPanelProps) {
  const hasTests = testCases && testCases.length > 0;
  const isEvaluated = !!evaluationResult;
  const attemptsRemaining = maxAttempts && maxAttempts > 0 ? maxAttempts - (attemptCount ?? 0) : null;
  const isAttemptsExhausted = attemptsRemaining !== null && attemptsRemaining <= 0;

  return (
    <div className="w-[350px] flex flex-col bg-background">
      <div className="flex justify-between items-center p-2 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Casos de Prueba
        </span>
        <div className="flex items-center gap-1">
          {onSubmit && (
            <Button
              onClick={onSubmit}
              disabled={isSubmitting || isAttemptsExhausted}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                isSubmitting || isAttemptsExhausted
                  ? "bg-primary/50 opacity-50 cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? "Testeando..." : "Test"}
            </Button>
          )}
          {onAddTestCase && (
            <Button
              onClick={onAddTestCase}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Añadir
            </Button>
          )}
        </div>
      </div>

      {maxAttempts && maxAttempts > 0 && (
        <div className={`px-3 py-1.5 border-b border-border flex items-center gap-2 ${
          isAttemptsExhausted ? "bg-red-500/10" : attemptsRemaining && attemptsRemaining <= 2 ? "bg-yellow-500/10" : "bg-background"
        }`}>
          <AlertCircle className={`w-3.5 h-3.5 ${
            isAttemptsExhausted ? "text-red-500" : attemptsRemaining && attemptsRemaining <= 2 ? "text-yellow-500" : "text-muted-foreground"
          }`} />
          <span className={`text-xs ${
            isAttemptsExhausted ? "text-red-500 font-medium" : attemptsRemaining && attemptsRemaining <= 2 ? "text-yellow-600" : "text-muted-foreground"
          }`}>
            {isAttemptsExhausted 
              ? "Sin intentos restantes"
              : `Intentos: ${(attemptCount ?? 0)}/${maxAttempts} (${attemptsRemaining} restantes)`
            }
          </span>
        </div>
      )}

      {evaluationResult && (
        <div className={`px-3 py-2 border-b border-border ${
          evaluationResult.status === "ACCEPTED"
            ? "bg-emerald-500/10"
            : "bg-red-500/10"
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className={`w-4 h-4 ${
              evaluationResult.status === "ACCEPTED" ? "text-emerald-500" : "text-red-500"
            }`} />
            <span className={`text-sm font-bold ${
              evaluationResult.status === "ACCEPTED" ? "text-emerald-500" : "text-red-500"
            }`}>
              {evaluationResult.status === "ACCEPTED" 
                ? `¡Aceptado! ${evaluationResult.passedTests}/${evaluationResult.totalTests}`
                : `${evaluationResult.passedTests}/${evaluationResult.totalTests} pasados (${evaluationResult.finalGrade}%)`
              }
            </span>
          </div>
        </div>
      )}

      <div className="p-3 flex flex-col gap-2 overflow-y-auto bg-muted/10 flex-1">
        {!hasTests && (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Sin casos de prueba públicos
          </div>
        )}
        {hasTests && testCases.map((tc, index) => (
          <TestCaseCard
            key={tc.id}
            testCase={tc}
            index={index}
            evaluated={isEvaluated}
          />
        ))}
      </div>
    </div>
  );
}

function TestCaseCard({ testCase, index, evaluated }: {
  testCase: PublicTestCase;
  index: number;
  evaluated: boolean;
}) {
  let inputDisplay = "";
  let expectedDisplay = "";
  try {
    inputDisplay = testCase.input ? decodeFromBase64(testCase.input) : "(sin input)";
  } catch {
    inputDisplay = testCase.input ?? "(sin input)";
  }
  try {
    expectedDisplay = testCase.expectedOutput ? decodeFromBase64(testCase.expectedOutput) : "(sin output esperado)";
  } catch {
    expectedDisplay = testCase.expectedOutput ?? "(sin output esperado)";
  }

  return (
    <div className="p-2.5 border border-border rounded-md bg-background shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Caso {index + 1}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Eye className="w-3 h-3" />
            Público
          </span>
        </div>
        {evaluated && (
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        )}
      </div>
        <div className="text-xs font-mono space-y-1 mt-2">
          <div>
            <span className="text-muted-foreground">Input: </span>
            <span className="text-foreground">{escapeHtml(inputDisplay)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Output esperado: </span>
            <span className="text-foreground">{escapeHtml(expectedDisplay)}</span>
          </div>
        </div>
    </div>
  );
}

export default TestCasesPanel;
