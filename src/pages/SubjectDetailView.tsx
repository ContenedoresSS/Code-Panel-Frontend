import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router"; // <-- Corregido: react-router-dom
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

import { SortableActivityItem } from "@/components/SortableActivityItem";
import { type SubjectResponse } from "@/types/response/SubjectResponse";

// <-- FALTABAN ESTOS IMPORTS -->
import type { ActivitySummaryResponse } from "@/types/response/ActivitySummaryResponse";
import { deleteActivity, getActivitiesBySubject } from "@/service/ActivityService"; 

import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { getSubjectById } from "@/service/SubjectService";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export default function SubjectDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [subject, setSubject] = useState<SubjectResponse | null>(null);
  const [activities, setActivities] = useState<ActivitySummaryResponse[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubjectAndActivities = async () => {
      if (!id) return;
      const subjectId = Number(id);
      try {
        setIsLoading(true);
        const [subjectData, activitiesData] = await Promise.all([
          getSubjectById(subjectId),
          getActivitiesBySubject(id) 
        ]);

        setSubject(subjectData);
        setActivities(activitiesData);
      } catch (error) {
        logger.error("Error al cargar la información:", error);
        navigate("/dashboard")
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectAndActivities();
  }, [id, navigate]);

  // --- CONFIGURACIÓN DRAG & DROP ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setActivities((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // --- HANDLERS ---
  const handleEditActivity = (activityId: string) => {
    navigate(`/subject/${id}/activity/${activityId}/edit`);
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta actividad? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await deleteActivity(activityId);

      setActivities(prev => prev.filter(a => a.id !== activityId));
    } catch (error) {
      logger.error("Error al eliminar la actividad:", error);
      toast.error("Hubo un error al eliminar la actividad.");
    }
  };

  const handleDuplicateActivity = (activityId: string) => {
    navigate(`/subject/${id}/activity/new?duplicate=${activityId}`);
  };


  // --- RENDER ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!subject) return null;

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      
      {/* Migas de pan */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/course">Cursos</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{subject.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{subject.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gestiona el contenido y las actividades de esta materia.</p>
        </div>
        
        {/* <-- CORREGIDO: Agregamos el onClick para navegar a la nueva vista de creación */}
        <Button 
          className="flex items-center gap-2"
          onClick={() => navigate(`/subject/${id}/activity/new`)}
        >
          <Plus className="w-4 h-4" />
          Nueva Actividad
        </Button>
      </div>

      {/* Lista de Actividades Arrastrables */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
          <h2 className="text-xl font-semibold text-foreground">Contenido del Curso</h2>
        </div>

        {activities.length > 0 ? (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={activities.map(a => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col">
                {activities.map((activity) => (
                  <SortableActivityItem 
                    key={activity.id} 
                    activity={activity} 
                    onEdit={handleEditActivity}
                    onDelete={handleDeleteActivity}
                    onDuplicate={handleDuplicateActivity}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-16 border rounded-xl border-dashed bg-muted/10 text-muted-foreground">
            Aún no hay actividades en este curso. Crea la primera para empezar.
          </div>
        )}
      </div>

    </div>
  );
}