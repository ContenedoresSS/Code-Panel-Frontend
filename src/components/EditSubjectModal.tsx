import { useState, useEffect } from "react";
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
  onSubmit: (id: number , upadateDataSubject: CreateSubjectRequest) => void;
  course: SubjectResponse | null; // Recibe el curso actual a editar
}

export function EditSubjecteModal({ isOpen, onClose, onSubmit, course }: EditCourseModalProps) {
  const [formData, setFormData] = useState<CreateSubjectRequest>({
    name: "",
  });
  // Cuando el modal se abre o el curso cambia, prellenamos el input con el nombre actual
  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        // Si en el futuro SubjectResponse tiene más datos, los asignas aquí:
        // description: course.description || "",
      });
    } else {
      
      setFormData({
        name: "",
      });
    }
  }, [course]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.name.trim() || !course) return;

    // Enviamos el ID y el objeto completo al componente padre
    onSubmit(course.id, formData);
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
              // Usamos formData.name
              value={formData.name}
              // Actualizamos conservando el resto del objeto usando ...formData
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Introducción a React"
              required
            />
          </div>

          {/* EJEMPLO PARA EL FUTURO:
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Input 
                id="edit-description" 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          */}

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