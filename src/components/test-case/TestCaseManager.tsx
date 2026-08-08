import { FileCode2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TestCase } from "@/types/response/TestCase";

interface TestCaseManagerProps {
  testCases: TestCase[];
  onOpenManagement: () => void;
}

export function TestCaseManager({ testCases, onOpenManagement }: TestCaseManagerProps) {
  const publicCount = testCases.filter((tc) => !tc.isHidden).length;
  const hiddenCount = testCases.filter((tc) => tc.isHidden).length;

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        onClick={onOpenManagement}
        className="w-full justify-start gap-2 h-auto py-3"
      >
        <FileCode2 className="w-4 h-4 flex-shrink-0" />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">Casos de Prueba</span>
          {testCases.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {publicCount} público{publicCount !== 1 ? "s" : ""}, {hiddenCount} oculto{hiddenCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </Button>
    </div>
  );
}

export default TestCaseManager;
