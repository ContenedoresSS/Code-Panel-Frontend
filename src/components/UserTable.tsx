import type { UserListItem } from "@/types/response/UserListItem";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Edit2, Loader2, Users } from "lucide-react";

interface UserTableProps {
  users: UserListItem[];
  isLoading: boolean;
  onEdit: (user: UserListItem) => void;
}

function roleBadgeClass(roleName: string): string {
  switch (roleName) {
    case "God":
      return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50";
    case "Teacher":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50";
    default:
      return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50";
  }
}

export function UserTable({ users, isLoading, onEdit }: UserTableProps) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Matrícula/Clave del Trabajador</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-32 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Cargando usuarios...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-32 text-slate-400">
                <Users className="h-6 w-6 mx-auto mb-2" />
                No se encontraron usuarios.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user.id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
              >
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="text-foreground font-semibold">
                      {user.name} {user.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {user.identifier ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={roleBadgeClass(user.role.name)}
                  >
                    {user.role.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50"
                    >
                      Activo
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800"
                    >
                      Inactivo
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(user)}
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Editar usuario"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default UserTable;
