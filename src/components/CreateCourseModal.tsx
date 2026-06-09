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
import type { CreateSubjectRequest } from "@/types/request/CreateSubjectRequest";

// Tipo para los datos del formulario (sin ID, ya que se suele generar en el backend)


interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSubjectRequest) => void;
}

export function CreateCourseModal({ isOpen, onClose, onSubmit }: CreateCourseModalProps) {
  const [name, setName] = useState("");


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!name.trim()) return;

    // Enviamos los datos al componente padre
    onSubmit({ name});
    
    // Limpiamos el formulario para la próxima vez que se abra
    setName("");

  };

  // Manejar el cierre desde la "X" o al hacer clic fuera del modal
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] dark:bg-zinc-950 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Curso</DialogTitle>
          <DialogDescription>
            Ingresa los detalles del nuevo curso. Haz clic en guardar cuando termines.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del curso</Label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Introducción a React"
              required
            />
          </div>
          
          {/*<div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            
            <textarea 
              id="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción del curso..."
              required
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de la Portada</Label>
            <Input 
              id="imageUrl" 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg o ruta local"
              required
            />
          </div>*/}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Curso</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}