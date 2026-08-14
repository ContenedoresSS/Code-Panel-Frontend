import { Play, XCircle } from "lucide-react";
import { Button } from "../ui/button";
import { escapeHtml } from "@/utils/sanitize.util";
import type { EvaluationResult } from "@/types/response/EvaluationResult";

interface OutputPanelProps {
  output: string;
  isExecuting: boolean;
  onRun: () => void;
  evaluationResult?: EvaluationResult | null;
}

export function OutputPanel({ output, isExecuting, onRun, evaluationResult }: OutputPanelProps) {
  return (
    <div className="w-[350px] flex flex-col bg-background">
      <div className="flex justify-between items-center p-2 border-b border-border gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Output
        </span>
        <Button
          onClick={onRun}
          disabled={isExecuting}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            isExecuting
              ? "bg-muted opacity-50 cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          <Play className={`w-3.5 h-3.5 ${isExecuting ? "animate-pulse" : "fill-current"}`} />
          {isExecuting ? "Running..." : "Run"}
        </Button>
      </div>

      {evaluationResult && evaluationResult.compilerOutput && (
        <div className="p-3 border-b border-border bg-red-500/10">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-bold text-red-500">Error de compilación</span>
          </div>
          <p className="text-xs text-red-400 font-mono whitespace-pre-wrap">
            {escapeHtml(evaluationResult.compilerOutput)}
          </p>
        </div>
      )}

      <div className="p-4 flex-1 overflow-y-auto font-mono text-sm text-muted-foreground bg-muted/10 whitespace-pre-wrap">
        {escapeHtml(output)}
      </div>
    </div>
  );
}

export default OutputPanel;
