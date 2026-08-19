import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router";
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
import type { SubjectResponse } from "@/types/response/SubjectResponse";
import type { ActivitySummaryResponse } from "@/types/response/ActivitySummaryResponse";
import { deleteActivity, getActivitiesBySubject } from "@/service/ActivityService";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function SubjectDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subject } = useOutletContext<{ subject: SubjectResponse }>();

  const [activities, setActivities] = useState<ActivitySummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setActivities(await getActivitiesBySubject(id));
      } catch (error) {
        logger.error("Error al cargar la información:", error);
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [id, navigate]);

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

  const handleEditActivity = (activityId: string) => {
    navigate(`/subject/${id}/activity/${activityId}/edit`);
  };

  const handleDeleteActivity = (activityId: string) => {
    setDeleteActivityId(activityId);
  };

  const confirmDeleteActivity = async () => {
    if (!deleteActivityId) return;
    try {
      await deleteActivity(deleteActivityId);
      setActivities(prev => prev.filter(a => a.id !== deleteActivityId));
    } catch (error) {
      logger.error("Error al eliminar la actividad:", error);
      toast.error("Hubo un error al eliminar la actividad.");
    } finally {
      setDeleteActivityId(null);
    }
  };

  const handleDuplicateActivity = (activityId: string) => {
    navigate(`/subject/${id}/activity/new?duplicate=${activityId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-300px)]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!subject) return null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <p className="text-muted-foreground mt-1 text-sm">Gestiona el contenido y las actividades de esta materia.</p>
        <Button
          className="flex items-center gap-2"
          onClick={() => navigate(`/subject/${id}/activity/new`)}
        >
          <Plus className="w-4 h-4" />
          Nueva Actividad
        </Button>
      </div>

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

      <ConfirmDialog
        open={deleteActivityId !== null}
        onOpenChange={(open) => { if (!open) setDeleteActivityId(null); }}
        title="Eliminar Actividad"
        description="¿Estás seguro de que deseas eliminar esta actividad? Esta acción no se puede deshacer."
        onConfirm={confirmDeleteActivity}
      />
    </div>
  );
}
