import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { ClipboardList, ChevronDown, ChevronRight, Loader2, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getActivitiesBySubject, getActivityGrades } from "@/service/ActivityService";
import { SubmissionDetailModal } from "@/components/SubmissionDetailModal";
import type { ActivitySummaryResponse } from "@/types/response/ActivitySummaryResponse";
import type { StudentGrade } from "@/types/response/StudentGrade";
import type { StudentSubmission } from "@/types/response/StudentSubmission";
import type { SubmissionStatus } from "@/types/response/EvaluationResult";
import { logger } from "@/lib/logger";

const STATUS_LABELS: Record<SubmissionStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ACCEPTED: { label: "Aceptado", variant: "default" },
  WRONG_ANSWER: { label: "Respuesta incorrecta", variant: "secondary" },
  COMPILE_ERROR: { label: "Error de compilación", variant: "destructive" },
  RUNTIME_ERROR: { label: "Error en ejecución", variant: "destructive" },
  TIME_LIMIT_EXCEEDED: { label: "Tiempo excedido", variant: "destructive" },
  PENDING: { label: "Pendiente", variant: "outline" },
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

interface GradeRowProps {
  grade: StudentGrade;
  onViewSubmission: (submissionId: string, studentName: string) => void;
}

function GradeRow({ grade, onViewSubmission }: GradeRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {grade.student.name} {grade.student.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {grade.student.email || grade.student.identifier || "Sin email"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Badge variant={grade.finalGrade !== null && grade.finalGrade >= 60 ? "default" : "secondary"}>
            {grade.finalGrade !== null ? `${grade.finalGrade}%` : "—"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {grade.submissions.length} intento{grade.submissions.length !== 1 ? "s" : ""}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-2">
          {grade.submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin envíos.</p>
          ) : (
            grade.submissions.map((sub) => (
              <SubmissionLine
                key={sub.id}
                submission={sub}
                onView={() => onViewSubmission(sub.id, `${grade.student.name} ${grade.student.lastName}`)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function SubmissionLine({
  submission,
  onView,
}: {
  submission: StudentSubmission;
  onView: () => void;
}) {
  const status = STATUS_LABELS[submission.status] ?? STATUS_LABELS.PENDING;
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-2 border border-border rounded-md bg-background">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="text-xs font-mono text-muted-foreground">
          {formatDate(submission.submittedAt)} {formatTime(submission.submittedAt)}
        </span>
        <Badge variant={status.variant} className="text-xs">
          {status.label}
        </Badge>
        <span className="text-xs text-foreground">
          {submission.finalGrade !== null ? `${submission.finalGrade}%` : "—"}
        </span>
        <span className="text-xs text-muted-foreground">
          {submission.passedTests}/{submission.totalTests} tests
        </span>
        {submission.executionTimeMs !== null && (
          <span className="text-xs text-muted-foreground">{submission.executionTimeMs} ms</span>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={onView} className="gap-1.5 text-xs">
        <Eye className="w-3.5 h-3.5" />
        Ver detalles
      </Button>
    </div>
  );
}

export default function SubjectGrades() {
  const { id } = useParams<{ id: string }>();

  const [activities, setActivities] = useState<ActivitySummaryResponse[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState<{ submissionId: string; studentName: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoadingActivities(true);
    getActivitiesBySubject(id)
      .then((data) => {
        setActivities(data);
        if (data.length > 0) {
          setSelectedActivityId(data[0].id);
        }
      })
      .catch((error) => logger.error("Error al cargar actividades:", error))
      .finally(() => setIsLoadingActivities(false));
  }, [id]);

  const loadGrades = useCallback(async (activityId: string) => {
    if (!activityId) return;
    setIsLoadingGrades(true);
    try {
      const data = await getActivityGrades(activityId);
      setGrades(data.data);
    } catch (error) {
      logger.error("Error al cargar calificaciones:", error);
      setGrades([]);
    } finally {
      setIsLoadingGrades(false);
    }
  }, []);

  useEffect(() => {
    loadGrades(selectedActivityId);
  }, [selectedActivityId, loadGrades]);

  const filteredGrades = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return grades;
    return grades.filter((g) => {
      const full = `${g.student.name} ${g.student.lastName} ${g.student.email} ${g.student.identifier ?? ""}`.toLowerCase();
      return full.includes(term);
    });
  }, [grades, searchTerm]);

  const selectedActivity = activities.find((a) => a.id === selectedActivityId);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="sm:w-72">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Actividad
          </label>
          <select
            value={selectedActivityId}
            onChange={(e) => setSelectedActivityId(e.target.value)}
            disabled={isLoadingActivities || activities.length === 0}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring disabled:opacity-50"
          >
            {activities.length === 0 && <option value="">Sin actividades</option>}
            {activities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>
        <div className="relative flex-1 self-end">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email o matrícula..."
            className="pl-9"
          />
        </div>
      </div>

      {selectedActivity && (
        <p className="text-sm text-muted-foreground mb-4">
          Calificaciones de <span className="font-medium text-foreground">{selectedActivity.title}</span>
        </p>
      )}

      {isLoadingActivities ? (
        <div className="flex justify-center items-center h-[30vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-16 border rounded-xl border-dashed bg-muted/10 text-muted-foreground">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">No hay actividades en esta materia</p>
        </div>
      ) : isLoadingGrades ? (
        <div className="flex justify-center items-center h-[30vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredGrades.length === 0 ? (
        <div className="text-center py-16 border rounded-xl border-dashed bg-muted/10 text-muted-foreground">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">
            {searchTerm ? "Ningún estudiante coincide con el filtro." : "Aún no hay envíos para esta actividad."}
          </p>
          <p className="text-xs mt-1">Los estudiantes aparecerán aquí cuando envíen su solución.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGrades.map((grade) => (
            <GradeRow
              key={grade.student.id}
              grade={grade}
              onViewSubmission={(submissionId, studentName) =>
                setModal({ submissionId, studentName })
              }
            />
          ))}
        </div>
      )}

      <SubmissionDetailModal
        open={modal !== null}
        onClose={() => setModal(null)}
        activityId={selectedActivityId}
        submissionId={modal?.submissionId ?? ""}
        studentName={modal?.studentName}
      />
    </div>
  );
}
