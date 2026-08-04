import { Play } from "lucide-react";
import { Button } from "../ui/button";
import { escapeHtml } from "@/utils/sanitize.util";

interface OutputPanelProps {
  output: string;
  isExecuting: boolean;
  onRun: () => void;
}

export function OutputPanel({ output, isExecuting, onRun }: OutputPanelProps) {
  return (
    <div className="w-[350px] flex flex-col bg-background">
      <div className="flex justify-between items-center p-2 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Output
        </span>
        <Button
          onClick={onRun}
          disabled={isExecuting}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-border rounded-md transition-colors ${
            isExecuting
              ? "bg-muted opacity-50 cursor-not-allowed"
              : "hover:bg-muted"
          }`}
        >
          <Play
            className={`w-3.5 h-3.5 ${isExecuting ? "animate-pulse" : "fill-current"}`}
          />
          {isExecuting ? "Running..." : "Run"}
        </Button>
      </div>
      <div className="p-4 flex-1 overflow-y-auto font-mono text-sm text-muted-foreground bg-muted/10 whitespace-pre-wrap">
        {escapeHtml(output)}
      </div>
    </div>
  );
}

export default OutputPanel;
