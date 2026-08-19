import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy } from "lucide-react";
import type { SubjectResponse } from "@/types/response/SubjectResponse";

interface DuplicateSubjectModalProps {
  isOpen: boolean;
  subject: SubjectResponse | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (name?: string) => void;
}

export function DuplicateSubjectModal({
  isOpen,
  subject,
  isLoading = false,
  onClose,
  onConfirm,
}: DuplicateSubjectModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(name.trim() || undefined);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] dark:bg-zinc-950 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-4 h-4 text-primary" />
            Duplicar Curso
          </DialogTitle>
          <DialogDescription>
            Se creará una copia de{" "}
            <span className="font-medium text-foreground">{subject?.name ?? "esta materia"}</span>{" "}
            con sus actividades y casos de prueba.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="duplicate-name">Nuevo nombre (opcional)</Label>
            <Input
              id="duplicate-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={subject ? `${subject.name} (copia)` : "Nombre de la copia"}
            />
            <p className="text-xs text-muted-foreground">
              Si lo dejas vacío se usará:{" "}
              <span className="font-medium">"{subject?.name ?? "..."} (copia)"</span>
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
            Se copian las <span className="font-medium text-foreground">actividades</span> y{" "}
            <span className="font-medium text-foreground">casos de prueba</span>. No se copian las
            inscripciones ni los envíos de los alumnos.
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Duplicar Curso
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DuplicateSubjectModal;
