import { useEffect, useState } from "react";
import { NavLink, Outlet, useParams, useLocation } from "react-router";
import { Layers, Users, ClipboardList, Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getSubjectById } from "@/service/SubjectService";
import type { SubjectResponse } from "@/types/response/SubjectResponse";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";

export default function SubjectLayout() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isActivityEditor = /\/activity\/(new|[^/]+\/edit)$/.test(location.pathname);
  const [subject, setSubject] = useState<SubjectResponse | null>(null);

  useEffect(() => {
    if (!id) return;
    getSubjectById(Number(id))
      .then(setSubject)
      .catch((error) => logger.error("Error al cargar la materia:", error));
  }, [id]);

  const navItems = [
    { to: `/subject/${id}`, label: "Contenido", icon: Layers, end: true },
    { to: `/subject/${id}/students`, label: "Alumnos", icon: Users, end: false },
    { to: `/subject/${id}/grades`, label: "Calificaciones", icon: ClipboardList, end: false },
  ];

  return (
    <div className={isActivityEditor ? "px-2 py-4" : "container max-w-5xl mx-auto px-4 py-8"}>
      {!isActivityEditor && (
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/course">Cursos</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{subject?.name ?? "Materia"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {!isActivityEditor && (
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold text-foreground">{subject?.name ?? "Materia"}</h1>
        </div>
      )}

      {!isActivityEditor && (
        <nav className="flex gap-1 border-b border-border mb-8">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      )}

      {!subject ? (
        <div className="flex justify-center items-center h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <Outlet context={{ subject }} />
      )}
    </div>
  );
}
