import type { InvitationDTO } from "@/types/dto/InvitationDTO";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge, RefreshCw, Search, Unlock,Lock, Trash2 } from "lucide-react";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { Button } from "./ui/button";


interface InvitationTableProps{
  invitations: InvitationDTO[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onToggleIsUsed: (id: number, currentIsUsed: boolean) => void;
  onDelete: (id: number) => void;
}
export function InvitationTable({
  invitations,
  isLoading,
  searchQuery,
  onSearchChange,
  onToggleIsUsed,
  onDelete,
}: InvitationTableProps) {
  
  // Filtrado en tiempo real basado en los DTOs del backend
  const filteredInvitations = (Array.isArray(invitations) ? invitations : []).filter((inv) =>
    inv.code.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar por código de invitación..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
        />
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead>Disponibilidad</TableHead>
              <TableHead className="text-right">Acciones</TableHead> {/* <-- Cambiamos el título */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-32 text-slate-400">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Cargando registros...
                </TableCell>
              </TableRow>
            ) : filteredInvitations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-32 text-slate-400">
                  No se encontraron códigos de invitación.
                </TableCell>
              </TableRow>
            ) : (
              filteredInvitations.map((inv) => (
                <TableRow 
                  key={inv.id} 
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                >
                  <TableCell className="font-mono text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100">
                    {inv.code}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {!inv.isUsed ? (
                      <Badge 
                        fontVariant="outline" 
                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50 gap-1"
                      >
                        <Unlock className="h-3 w-3" /> Disponible
                      </Badge>
                    ) : (
                      <Badge 
                        fontVariant="outline" 
                        className="bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800 gap-1"
                      >
                        <Lock className="h-3 w-3" /> Usado / Inactivo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Contenedor Flex para alinear el Switch y el botón de Eliminar */}
                    <div className="flex items-center justify-end gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{!inv.isUsed ? 'Activo' : 'Inactivo'}</span>
                        <Switch
                          checked={!inv.isUsed}
                          onCheckedChange={() => onToggleIsUsed(inv.id, inv.isUsed)}
                          
                        />
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(inv.id)}
                        // Usamos 'destructive' para el botón de eliminar
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Eliminar código"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}