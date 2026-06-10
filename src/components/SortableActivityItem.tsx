import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GripVertical, MoreVertical, Code2, Calendar } from "lucide-react";
import type { ActivitySummaryResponse } from '@/types/response/ActivitySummaryResponse';

interface SortableActivityItemProps {
  activity: ActivitySummaryResponse;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function SortableActivityItem({ activity, onEdit, onDelete }: SortableActivityItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  // Formatear la fecha para que se vea legible (Ej: "12 de oct, 2026")
  const formattedDate = new Date(activity.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center gap-4 p-4 mb-3 border rounded-xl bg-card text-card-foreground transition-colors ${
        isDragging 
          ? 'shadow-lg border-primary/50 opacity-90' 
          : 'shadow-sm hover:border-border/80 dark:bg-zinc-900/40 dark:border-zinc-800'
      }`}
    >
      {/* Botón de arrastre */}
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 focus:outline-none">
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex-shrink-0 text-muted-foreground">
        <Code2 className="w-5 h-5 text-blue-500/80" />
      </div>

      {/* Información principal */}
      <div className="flex-grow min-w-0">
        <p className="font-medium text-sm sm:text-base truncate">
          {activity.title}
        </p>
        <p className="text-xs text-muted-foreground truncate max-w-[90%] mt-0.5">
          {activity.description ? activity.description : "Sin descripción adicional"}
        </p>
      </div>

      {/* Etiquetas / Metadatos */}
      <div className="hidden sm:flex items-center gap-3">
        <div className="flex items-center text-xs text-muted-foreground gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {formattedDate}
        </div>
        <Badge variant="outline" className="dark:border-zinc-700">
          ID Lenguaje: {activity.languageId}
        </Badge>
      </div>

      {/* Opciones */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => onEdit?.(activity.id)}>
            Editar actividad
          </DropdownMenuItem>
          <DropdownMenuItem>Configurar tests</DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete?.(activity.id)}
          >
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}