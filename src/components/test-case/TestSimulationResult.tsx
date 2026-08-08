import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface TestSimulationResultProps {
  results: TestSimulationResult[];
}

export interface TestSimulationResult {
  testCaseId: number;
  testCaseName: string;
  passed: boolean;
  expected: string;
  actual: string;
  error?: string;
}

export function TestSimulationResult({ results }: TestSimulationResultProps) {
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount;

  return (
    <div className="border-t border-border pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Resultados de la simulación</h3>
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${
            allPassed
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-red-500/10 text-red-500"
          }`}
        >
          {passedCount}/{totalCount} casos pasados
        </span>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {results.map((result) => (
          <TestCaseResultItem key={result.testCaseId} result={result} />
        ))}
      </div>
    </div>
  );
}

interface TestCaseResultItemProps {
  result: TestSimulationResult;
}

function TestCaseResultItem({ result }: TestCaseResultItemProps) {
  return (
    <div
      className={`p-3 border rounded-lg ${
        result.passed ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"
      }`}
    >
      <div className="flex items-start gap-2">
        {result.passed ? (
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
        ) : result.error ? (
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        ) : (
          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{result.testCaseName}</span>
          </div>

          {result.error ? (
            <div className="text-xs text-amber-600 font-mono whitespace-pre-wrap break-words">
              {result.error}
            </div>
          ) : !result.passed ? (
            <div className="space-y-1">
              <div className="text-xs">
                <span className="text-muted-foreground">Esperado: </span>
                <span className="font-mono text-foreground">{result.expected}</span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Obtenido: </span>
                <span className="font-mono text-red-500">{result.actual}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Output correcto
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestSimulationResult;
