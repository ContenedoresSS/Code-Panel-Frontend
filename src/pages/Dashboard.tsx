import { useEffect, useState } from "react";
import { BookOpen, FileText, Layers, Loader2, BadgeCheck } from "lucide-react";
import { StatCard } from "@/components/CardInfo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/assets/context/useAuth";
import { getSubjectsByUser } from "@/service/SubjectService";
import { getActivitiesTotal } from "@/service/ActivityService";
import { getMyEnrollments } from "@/service/EnrollmentService";
import { UserRole } from "@/types/enum/UserRole";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface DashboardStats {
  subjectCount: number;
  activityCount: number;
}

export default function Dashboard() {
  const { user, logoutState } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ subjectCount: 0, activityCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutState();
    navigate("/login");
  };

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const isTeacherOrGod =
          user.role === UserRole.TEACHER || user.role === UserRole.GOD;

        let subjectCount = 0;
        let activityCount = 0;

        if (isTeacherOrGod) {
          const [subjects, activitiesTotal] = await Promise.all([
            getSubjectsByUser(),
            getActivitiesTotal(),
          ]);
          subjectCount = subjects.length;
          activityCount = activitiesTotal;
        } else if (user.role === UserRole.STUDENT) {
          const enrollments = await getMyEnrollments().catch(() => null);
          subjectCount = enrollments?.totalCount ?? 0;
        }

        if (active) {
          setStats({ subjectCount, activityCount });
        }
      } catch {
        toast.error("Error al cargar el resumen del dashboard");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadStats();
    return () => {
      active = false;
    };
  }, [user]);

  const isTeacherOrGod =
    user?.role === UserRole.TEACHER || user?.role === UserRole.GOD;

  if (user?.role === UserRole.STUDENT) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-2xl mx-auto p-4 text-center">
        <div className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-xl mb-6">
          <BadgeCheck className="size-12" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
          ¡Registro exitoso, {user.name}!
        </h1>
        <p className="text-lg text-muted-foreground mb-3">
          Tu cuenta de estudiante se registró correctamente en CodePanel.
        </p>
        <p className="text-base text-muted-foreground mb-8">
          Las actividades se realizan dentro de la plataforma de tu curso (Moodle). No tienes
          acceso a las secciones administrativas desde aquí.
        </p>
        <Button variant="outline" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-5xl mx-auto p-4">
      <div className="w-full text-left md:text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
          Bienvenido {user?.name}.
        </h1>
        <p className="text-lg text-muted-foreground">
          Aquí tienes un resumen de tu actividad académica hoy.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <StatCard
            title={isTeacherOrGod ? "Total de Cursos" : "Mis Materias"}
            value={stats.subjectCount}
            icon={isTeacherOrGod ? <BookOpen className="size-8" /> : <Layers className="size-8" />}
            iconBgClass="bg-emerald-500/10 dark:bg-emerald-500/20"
            iconColorClass="text-emerald-600 dark:text-emerald-400"
          />

          {isTeacherOrGod && (
            <StatCard
              title="Total de Actividades"
              value={stats.activityCount}
              icon={<FileText className="size-8" />}
              iconBgClass="bg-blue-500/10 dark:bg-blue-500/20"
              iconColorClass="text-blue-600 dark:text-blue-400"
            />
          )}
        </div>
      )}
    </div>
  );
}
