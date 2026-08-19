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
import type { SubjectResponse } from "@/types/response/SubjectResponse";
import type { CreateSubjectRequest } from "@/types/request/CreateSubjectRequest";

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, updateDataSubject: CreateSubjectRequest) => void;
  course: SubjectResponse | null;
}

export function EditSubjecteModal({ isOpen, onClose, onSubmit, course }: EditCourseModalProps) {
  const [formData, setFormData] = useState<CreateSubjectRequest>(() => ({
    name: course?.name ?? "",
    imageUrl: course?.imageUrl ?? "",
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !course) return;

    onSubmit(course.id, {
      name: formData.name,
      imageUrl: formData.imageUrl?.trim() || undefined,
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] dark:bg-zinc-950 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle>Editar Curso</DialogTitle>
          <DialogDescription>
            Modifica la información del curso. Haz clic en guardar cuando termines.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre del curso</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Introducción a React"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-imageUrl">URL de la Portada</Label>
            <Input
              id="edit-imageUrl"
              value={formData.imageUrl || ""}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
