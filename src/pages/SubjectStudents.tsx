import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { Loader2, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getSubjectStudents } from "@/service/SubjectService";
import type { EnrolledStudent } from "@/types/response/EnrolledStudent";
import { logger } from "@/lib/logger";

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

export default function SubjectStudents() {
  const { id } = useParams<{ id: string }>();
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await getSubjectStudents(Number(id));
      setStudents(data.data);
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
      if (!term) return true;
      const full = `${s.name} ${s.lastName} ${s.email} ${s.identifier ?? ""}`.toLowerCase();
      return full.includes(term);
    });
  }, [students, searchTerm]);

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
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr] gap-4 px-4 py-3 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Nombre</span>
            <span>Email / Matrícula</span>
            <span>Fecha de inscripción</span>
          </div>
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr] gap-2 sm:gap-4 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {student.name} {student.lastName}
                </p>
                <p className="text-xs text-muted-foreground sm:hidden truncate">
                  {student.email || student.identifier || "Sin email"}
                </p>
              </div>
              <p className="text-sm text-muted-foreground truncate hidden sm:block">
                {student.email || student.identifier || "—"}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDate(student.enrolledAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
