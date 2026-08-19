import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { ChevronDown, ChevronRight, Loader2, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getSubjectStudents } from "@/service/SubjectService";
import { getActivitiesBySubject, getActivityGrades } from "@/service/ActivityService";
import type { EnrolledStudent } from "@/types/response/EnrolledStudent";
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

interface StudentRowProps {
  student: EnrolledStudent;
  activities: ActivitySummaryResponse[];
  gradesByActivity: Record<string, StudentGrade[]>;
}

function StudentRow({ student, activities, gradesByActivity }: StudentRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  const gradeForActivity = (activityId: string): StudentGrade | undefined =>
    gradesByActivity[activityId]?.find((g) => g.student.id === student.id);

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
              {student.name} {student.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {student.email || student.identifier || "Sin email"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="text-xs">
            {activities.filter((a) => gradeForActivity(a.id)).length}/{activities.length} actividades
          </Badge>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border">
          {activities.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No hay actividades en esta materia.</p>
          ) : (
            activities.map((activity) => {
              const grade = gradeForActivity(activity.id);
              return (
                <div key={activity.id} className="border-b border-border last:border-b-0">
                  <button
                    onClick={() =>
                      setExpandedActivity((prev) => (prev === activity.id ? null : activity.id))
                    }
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {grade && grade.submissions.length > 0 && (
                        <>
                          {expandedActivity === activity.id ? (
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          )}
                        </>
                      )}
                      <span className="text-sm font-medium text-foreground truncate">
                        {activity.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {grade ? (
                        <>
                          <Badge variant={grade.finalGrade !== null && grade.finalGrade >= 60 ? "default" : "secondary"}>
                            {grade.finalGrade !== null ? `${grade.finalGrade}%` : "—"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {grade.submissions.length} intento{grade.submissions.length !== 1 ? "s" : ""}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin envíos</span>
                      )}
                    </div>
                  </button>

                  {expandedActivity === activity.id && grade && grade.submissions.length > 0 && (
                    <div className="bg-muted/30 px-4 py-3 space-y-2">
                      {grade.submissions.map((sub) => (
                        <SubmissionRow key={sub.id} submission={sub} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function SubmissionRow({ submission }: { submission: StudentSubmission }) {
  const status = STATUS_LABELS[submission.status] ?? STATUS_LABELS.PENDING;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 border border-border rounded-md bg-background">
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
  );
}

export default function SubjectStudents() {
  const { id } = useParams<{ id: string }>();
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [activities, setActivities] = useState<ActivitySummaryResponse[]>([]);
  const [gradesByActivity, setGradesByActivity] = useState<Record<string, StudentGrade[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activityFilter, setActivityFilter] = useState<string>("");

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [studentsData, activitiesData] = await Promise.all([
        getSubjectStudents(Number(id)),
        getActivitiesBySubject(id),
      ]);
      setStudents(studentsData.data);
      setActivities(activitiesData);

      const gradesMap: Record<string, StudentGrade[]> = {};
      await Promise.all(
        activitiesData.map(async (activity) => {
          try {
            const grades = await getActivityGrades(activity.id);
            gradesMap[activity.id] = grades.data;
          } catch (error) {
            logger.error(`Error al cargar calificaciones de ${activity.id}:`, error);
          }
        })
      );
      setGradesByActivity(gradesMap);
    } catch (error) {
      logger.error("Error al cargar alumnos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return students.filter((s) => {
      if (term) {
        const full = `${s.name} ${s.lastName} ${s.email} ${s.identifier ?? ""}`.toLowerCase();
        if (!full.includes(term)) return false;
      }
      return true;
    });
  }, [students, searchTerm]);

  const filteredActivities = useMemo(() => {
    if (!activityFilter) return activities;
    return activities.filter((a) => a.id === activityFilter);
  }, [activities, activityFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[40vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email o matrícula..."
            className="pl-9"
          />
        </div>
        <select
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring"
        >
          <option value="">Todas las actividades</option>
          {activities.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-16 border rounded-xl border-dashed bg-muted/10 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">No hay alumnos en esta materia</p>
          <p className="text-xs mt-1">
            {students.length === 0
              ? "Los alumnos deben inscribirse para aparecer aquí."
              : "Ningún alumno coincide con el filtro."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              activities={filteredActivities}
              gradesByActivity={gradesByActivity}
            />
          ))}
        </div>
      )}
    </div>
  );
}
