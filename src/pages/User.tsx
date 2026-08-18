import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { toast } from "sonner";
import { UserTable } from "@/components/UserTable";
import { EditUserModal } from "@/components/EditUserModal";
import { getUsers } from "@/service/UserService";
import { logger } from "@/lib/logger";
import type { UserListItem } from "@/types/response/UserListItem";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/types/enum/UserRole";

const PAGE_SIZE = 10;

export default function User() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        role: roleFilter === "all" ? undefined : roleFilter,
        search: debouncedSearch || undefined,
      };
      const response = await getUsers(params);
      setUsers(response.data);
      setTotalCount(response.totalCount);
    } catch (error) {
      logger.error("Error al obtener usuarios:", error);
      toast.error("Error al obtener el listado de usuarios");
    } finally {
      setIsLoading(false);
    }
  }, [page, roleFilter, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleUserUpdated = (updatedUser: UserListItem) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    setEditingUser(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Administra los usuarios de la plataforma: roles, estado de la cuenta y contraseñas.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{totalCount} usuarios</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre o apellido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-slate-200 dark:border-slate-800"
          />
        </div>
        <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value={UserRole.STUDENT}>Student</SelectItem>
            <SelectItem value={UserRole.TEACHER}>Teacher</SelectItem>
            <SelectItem value={UserRole.GOD}>God</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm w-full">
        <CardContent className="p-6">
          <UserTable
            users={users}
            isLoading={isLoading}
            onEdit={setEditingUser}
          />
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={handleUserUpdated}
      />
    </div>
  );
}
