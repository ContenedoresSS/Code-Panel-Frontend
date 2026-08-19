import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { decodeFromBase64 } from "@/utils/base64.util";
import type { TestCase } from "@/types/response/TestCase";

interface TestCaseModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; input: string; expectedOutput: string; isHidden: boolean }) => void;
  testCase?: TestCase | null;
}

export function TestCaseModal({ open, onClose, onSave, testCase }: TestCaseModalProps) {
  const [title, setTitle] = useState(() => (testCase ? `Caso ${testCase.id}` : ""));
  const [input, setInput] = useState(() =>
    testCase?.input ? decodeFromBase64(testCase.input) : ""
  );
  const [expectedOutput, setExpectedOutput] = useState(() =>
    testCase?.expectedOutput ? decodeFromBase64(testCase.expectedOutput) : ""
  );
  const [isHidden, setIsHidden] = useState(() => testCase?.isHidden ?? false);

  const handleSave = () => {
    if (!title.trim() || !expectedOutput.trim()) return;
    onSave({
      title: title.trim(),
      input: input.trim(),
      expectedOutput: expectedOutput.trim(),
      isHidden,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{testCase ? "Editar Caso de Prueba" : "Añadir Caso de Prueba"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Caso</Label>
            <Input
              id="title"
              placeholder="Ej. Caso 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="input">Entrada (stdin)</Label>
            <Textarea
              id="input"
              placeholder="Ingresa los valores de entrada..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[80px] font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedOutput">Salida Esperada</Label>
            <Textarea
              id="expectedOutput"
              placeholder="Ingresa la salida esperada..."
              value={expectedOutput}
              onChange={(e) => setExpectedOutput(e.target.value)}
              className="min-h-[80px] font-mono text-sm"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="space-y-1">
              <Label htmlFor="isHidden" className="text-sm font-medium">
                Caso Oculto
              </Label>
              <p className="text-xs text-muted-foreground">
                El estudiante no verá este caso de prueba
              </p>
            </div>
            <Switch id="isHidden" checked={isHidden} onCheckedChange={setIsHidden} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || !expectedOutput.trim()}
          >
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TestCaseModal;
