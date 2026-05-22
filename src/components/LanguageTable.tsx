import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Edit2, Trash2, TerminalSquare, Box, Loader2 } from "lucide-react";
import type { LanguageResponse } from "@/types/response/LanguageResponse";

interface LanguageTableProps {
  languages: LanguageResponse[];
  isLoading: boolean;
  onEdit?: (language: LanguageResponse) => void;
  onDelete?: (id: number) => void;
}

export default function LanguageTable({ languages, isLoading, onEdit, onDelete }: LanguageTableProps) {
  return (
    <Card className="border-border bg-card text-card-foreground shadow-sm h-full">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-xl font-bold">Lenguajes Disponibles</CardTitle>
        <CardDescription className="text-muted-foreground">
          Gestión de lenguajes de programación y sus imágenes de Docker.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Cargando lenguajes...</p>
          </div>
        ) : languages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Box className="w-12 h-12 mb-4 opacity-50" />
            <p>No hay lenguajes registrados todavía.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-semibold">Lenguaje</TableHead>
                  <TableHead className="text-muted-foreground font-semibold text-center">Versión</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Imagen Docker</TableHead>
                  <TableHead className="text-muted-foreground font-semibold text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {languages.map((lang) => (
                  <TableRow key={lang.id} className="border-border hover:bg-muted/50 transition-colors">
                    
                    {/* Columna: Nombre y Extensión */}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-md border border-primary/20">
                          <TerminalSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-foreground font-bold">{lang.name}</span>
                          <span className="text-xs text-muted-foreground">Ext: {lang.fileExtension}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Columna: Versión */}
                    <TableCell className="text-center">
                      <Badge variant="outline" className="border-border text-foreground font-medium">
                        {lang.version}
                      </Badge>
                    </TableCell>

                    {/* Columna: Imagen Docker y Comando */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-foreground">{lang.dockerImage}</span>
                        
                      </div>
                    </TableCell>

                    {/* Columna: Acciones */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onEdit?.(lang)}
                          className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDelete?.(lang.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}