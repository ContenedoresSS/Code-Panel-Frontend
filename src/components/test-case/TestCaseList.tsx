import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { decodeFromBase64 } from "@/utils/base64.util";
import type { TestCase } from "@/types/response/TestCase";

interface TestCaseListProps {
  testCases: TestCase[];
  onEdit: (testCase: TestCase) => void;
  onDelete: (testCaseId: number) => void;
}

export function TestCaseList({ testCases, onEdit, onDelete }: TestCaseListProps) {
  if (testCases.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        No hay casos de prueba configurados
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {testCases.map((tc, index) => (
        <TestCaseItem
          key={tc.id}
          testCase={tc}
          index={index}
          onEdit={() => onEdit(tc)}
          onDelete={() => onDelete(tc.id)}
        />
      ))}
    </div>
  );
}

interface TestCaseItemProps {
  testCase: TestCase;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

function TestCaseItem({ testCase, index, onEdit, onDelete }: TestCaseItemProps) {
  const inputPreview = testCase.input
    ? (() => {
        try {
          return decodeFromBase64(testCase.input);
        } catch {
          return testCase.input;
        }
      })()
    : "";

  const outputPreview = testCase.expectedOutput
    ? (() => {
        try {
          return decodeFromBase64(testCase.expectedOutput);
        } catch {
          return testCase.expectedOutput;
        }
      })()
    : "";

  const truncate = (str: string, max: number = 30) => {
    if (str.length <= max) return str;
    return str.substring(0, max) + "...";
  };

  return (
    <div className="p-3 border border-border rounded-lg bg-background/50 hover:bg-background transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium truncate">
              {`Caso ${index + 1}`}
            </span>
            {testCase.isHidden && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                <EyeOff className="w-3 h-3 mr-1" />
                Oculto
              </Badge>
            )}
            {!testCase.isHidden && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                <Eye className="w-3 h-3 mr-1" />
                Público
              </Badge>
            )}
          </div>
          <div className="text-xs font-mono text-muted-foreground space-y-0.5">
            <div className="truncate">
              <span className="text-muted-foreground">Input: </span>
              <span className="text-foreground">
                {truncate(inputPreview, 25) || "(vacío)"}
              </span>
            </div>
            <div className="truncate">
              <span className="text-muted-foreground">Output: </span>
              <span className="text-foreground">
                {truncate(outputPreview, 25)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-7 w-7"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-7 w-7 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TestCaseList;
