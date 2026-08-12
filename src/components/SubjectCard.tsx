import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit2, Trash2, ImageIcon } from "lucide-react";
import type { SubjectResponse } from "@/types/response/SubjectResponse";

interface CourseCardProps {
  course: SubjectResponse;
  onAction: (id: number | string) => void;
  onEdit: (id: number | string) => void;
  onDelete: (id: number | string) => void;
}

export function CourseCard({ course, onAction, onEdit, onDelete }: CourseCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden dark:bg-zinc-900/50 dark:border-zinc-800 shadow-sm">
      {course.imageUrl ? (
        <div className="w-full h-36 bg-muted overflow-hidden">
          <img
            src={course.imageUrl}
            alt={course.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-36 bg-muted flex items-center justify-center">
          <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
        </div>
      )}

      <CardHeader className="pb-1 pt-4 flex flex-row items-start justify-between space-y-0 gap-2">
        <CardTitle className="text-lg font-semibold line-clamp-1 flex-1 text-foreground">
          {course.name}
        </CardTitle>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Opciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onClick={() => onEdit(course.id)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(course.id)}
              className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Eliminar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardFooter className="pt-0 mt-auto">
        <Button
          variant="default"
          className="w-full font-medium"
          onClick={() => onAction(course.id)}
        >
          Entrar
        </Button>
      </CardFooter>
    </Card>
  );
}
