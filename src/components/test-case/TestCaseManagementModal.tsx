import { useState } from "react";
import { Plus, Eye, EyeOff, Pencil, Trash2, FileCode2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TestCaseModal } from "./TestCaseModal";
import { TestSimulationResult, type TestSimulationResult as TestResultType } from "./TestSimulationResult";
import { encodeToBase64, decodeFromBase64 } from "@/utils/base64.util";
import { executionCode } from "@/service/EditorService";
import type { TestCase } from "@/types/response/TestCase";

interface TestCaseManagementModalProps {
  open: boolean;
  onClose: () => void;
  testCases: TestCase[];
  onChange: (testCases: TestCase[]) => void;
  currentCode: string;
  languageId: number;
}

export function TestCaseManagementModal({
  open,
  onClose,
  testCases,
  onChange,
  currentCode,
  languageId,
}: TestCaseManagementModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResultType[]>([]);

  const publicCount = testCases.filter((tc) => !tc.isHidden).length;
  const hiddenCount = testCases.filter((tc) => tc.isHidden).length;

  const handleAdd = () => {
    setEditingTestCase(null);
    setIsModalOpen(true);
  };

  const handleEdit = (testCase: TestCase) => {
    setEditingTestCase(testCase);
    setIsModalOpen(true);
  };

  const handleSave = (data: {
    title: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }) => {
    const payload = {
      input: data.input ? encodeToBase64(data.input) : null,
      expectedOutput: encodeToBase64(data.expectedOutput),
      isHidden: data.isHidden,
    };

    if (editingTestCase) {
      // Actualizar existente en estado local
      onChange(testCases.map((tc) =>
        tc.id === editingTestCase.id
          ? { ...tc, ...payload }
          : tc
      ));
    } else {
      // Crear nuevo con ID temporal negativo
      const offlineTestCase: TestCase = {
        id: -(testCases.length + 1),
        activityId: "",
        input: payload.input,
        expectedOutput: payload.expectedOutput,
        isHidden: payload.isHidden ?? false,
      };
      onChange([...testCases, offlineTestCase]);
    }
  };

  const handleDelete = (testCaseId: number) => {
    if (!confirm("¿Estás seguro de eliminar este caso de prueba?")) return;
    onChange(testCases.filter((tc) => tc.id !== testCaseId));
  };

  const handleRunTests = async () => {
    if (testCases.length === 0 || !currentCode.trim()) return;

    setIsTesting(true);
    setTestResults([]);

    const results: TestResultType[] = [];

    for (const tc of testCases) {
      const testCaseName = `Caso ${testCases.indexOf(tc) + 1}`;
      try {
        const decodedInput = tc.input ? decodeFromBase64(tc.input) : "";
        const decodedExpected = tc.expectedOutput ? decodeFromBase64(tc.expectedOutput) : "";

        const response = await executionCode({
          languageId,
          code: encodeToBase64(currentCode),
          stdin: encodeToBase64(decodedInput),
        });

        const actualOutput = response.stdout || "";
        const passed = actualOutput.trim() === decodedExpected.trim();

        results.push({
          testCaseId: tc.id,
          testCaseName,
          passed,
          expected: decodedExpected,
          actual: actualOutput,
        });
      } catch (error: unknown) {
        const err = error as { response?: { status?: number; data?: { error?: string } } };
        let errorMsg = "Error al ejecutar";
        if (err?.response?.status === 429) {
          errorMsg = "Límite de ejecuciones excedido. Espera 5 minutos.";
        } else if (err?.response?.data?.error) {
          errorMsg = err.response.data.error;
        }
        results.push({
          testCaseId: tc.id,
          testCaseName,
          passed: false,
          expected: "",
          actual: "",
          error: errorMsg,
        });
      }
    }

    setTestResults(results);
    setIsTesting(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[768px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5" />
                Casos de Prueba
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  {publicCount} público{publicCount !== 1 ? "s" : ""}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <EyeOff className="w-3 h-3 mr-1" />
                  {hiddenCount} oculto{hiddenCount !== 1 ? "s" : ""}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {testCases.length > 0 && currentCode.trim() && (
                  <Button onClick={handleRunTests} disabled={isTesting} size="sm" variant="secondary">
                    <Play className={`w-4 h-4 mr-1 ${isTesting ? "animate-spin" : ""}`} />
                    {isTesting ? "Ejecutando..." : "Ejecutar tests"}
                  </Button>
                )}
                <Button onClick={handleAdd} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Añadir caso
                </Button>
              </div>
            </div>

            {testCases.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileCode2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium mb-1">No hay casos de prueba</p>
                <p className="text-xs">Añade el primero para comenzar</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {testCases.map((tc, index) => (
                  <TestCaseItem
                    key={tc.id}
                    testCase={tc}
                    index={index}
                    onEdit={() => handleEdit(tc)}
                    onDelete={() => handleDelete(tc.id)}
                  />
                ))}
              </div>
            )}

            {testCases.length > 0 && (
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                Total: {testCases.length} caso{testCases.length !== 1 ? "s" : ""}
              </div>
            )}

            {testResults.length > 0 && (
              <TestSimulationResult results={testResults} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TestCaseModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        testCase={editingTestCase}
      />
    </>
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

  const truncate = (str: string, max: number = 40) => {
    if (str.length <= max) return str;
    return str.substring(0, max) + "...";
  };

  return (
    <div className="p-3 border border-border rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">Caso {index + 1}</span>
            {testCase.isHidden ? (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                <EyeOff className="w-3 h-3 mr-1" />
                Oculto
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                <Eye className="w-3 h-3 mr-1" />
                Público
              </Badge>
            )}
          </div>
          <div className="text-xs font-mono space-y-1">
            <div className="truncate">
              <span className="text-muted-foreground">Input: </span>
              <span className="text-foreground">
                {truncate(inputPreview) || "(vacío)"}
              </span>
            </div>
            <div className="truncate">
              <span className="text-muted-foreground">Output: </span>
              <span className="text-foreground">
                {truncate(outputPreview)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TestCaseManagementModal;
