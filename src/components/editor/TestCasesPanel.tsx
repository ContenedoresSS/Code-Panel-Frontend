import { CheckCircle, Circle } from "lucide-react";

export function TestCasesPanel() {
  return (
    <div className="w-[350px] flex flex-col bg-background">
      <div className="flex justify-between items-center p-2 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Test Case
        </span>
        <div className="flex items-center gap-2">
          <button className="text-xs font-medium px-2 py-1 hover:bg-muted rounded-md transition-colors">
            + Añadir caso
          </button>
          <button className="px-4 py-1.5 text-sm font-medium bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 rounded-md hover:opacity-90 transition-opacity">
            Test
          </button>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-2 overflow-y-auto bg-muted/10">
        <div className="flex justify-between items-center p-2.5 border border-border rounded-md bg-background shadow-sm">
          <span className="text-sm font-medium">Case 1</span>
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="flex justify-between items-center p-2.5 border border-border rounded-md bg-background shadow-sm opacity-60">
          <span className="text-sm font-medium">Case 2</span>
          <Circle className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

export default TestCasesPanel;
