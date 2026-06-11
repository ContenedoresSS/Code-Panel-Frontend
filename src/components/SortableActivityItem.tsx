import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GripVertical, MoreVertical, Code2, Calendar, Check, CodeXml } from "lucide-react";
import type { ActivitySummaryResponse } from '@/types/response/ActivitySummaryResponse';
import { useState } from 'react';

interface SortableActivityItemProps {
  activity: ActivitySummaryResponse;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function SortableActivityItem({ activity, onEdit, onDelete }: SortableActivityItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: activity.id });
  const [isCopied, setIsCopied] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const formattedDate = new Date(activity.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const handleCopyIframe = () => {
    // Aquí construirás la URL real de tu Iframe más adelante
    // Por ahora usamos una estructura de ejemplo basándonos en tu dominio
    const iframeCode = `<iframe src="https://codepanel.orchfr.duckdns.org/embed/activity/${activity.id}" width="100%" height="600px" style="border:none; border-radius:8px;"></iframe>`;
    
    navigator.clipboard.writeText(iframeCode).then(() => {
      setIsCopied(true);
      
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

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
        <Button 
          variant={isCopied ? "default" : "outline"} 
          size="sm" 
          className={`h-8 gap-1.5 transition-all duration-300 ${
            isCopied 
              ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500" 
              : "text-muted-foreground hover:text-foreground dark:border-zinc-700"
          }`}
          onClick={handleCopyIframe}
          title="Copiar código Iframe"
        >
        {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copiado
            </>
        ) : (
            <>
              <CodeXml className="w-3.5 h-3.5" />
              Iframe
            </>
        )}
        </Button>
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
          <DropdownMenuItem>Duplicar actividad</DropdownMenuItem>
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