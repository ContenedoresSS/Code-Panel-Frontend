
import { InvitationTable } from "@/components/InvitationTable";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Copy, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createInvitation, deleteInvitation, getAllInvitations, updateInvitation } from "@/service/InvitationsService";
import { type InvitationDTO } from "@/types/dto/InvitationDTO";

export default function Access () {
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [invitations, setInvitations] = useState<InvitationDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const PROFESOR_ROLE = 3;

  useEffect(()=>{
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
    const response = await getAllInvitations(1, 50); 
      
      setInvitations(response as unknown as InvitationDTO[]);
    } catch (error) {
      toast.error("Error al obtener el listado de codigos ")
    }finally{
      setIsLoading(false);
    }
  };

const handleGenerateCode = async () => {
  setIsGenerating(true);
  try {
    const newInvitation = await createInvitation({roleId:PROFESOR_ROLE});
    setInvitations([newInvitation,...invitations]);
    setGeneratedCode(newInvitation.code);
    setIsCopied(false);
    toast.success("Código de invitación creado correctamente");
  } catch (error) {
    toast.error("Error al generar el token de acceso");
  } finally {
    setIsGenerating(false);
  }
};

const handleCopyCode = () => {
  if (!generatedCode) return;
  navigator.clipboard.writeText(generatedCode);
  setIsCopied(true);
  toast.success("Código copiado al portapapeles");
  setTimeout(() => setIsCopied(false), 2000);
};

const handleToggleIsUsed = async (id: number, currentIsUsed: boolean) => {
  setInvitations((prev)=>
  prev.map((inv) => (inv.id === id?{...inv, isUsed:!currentIsUsed}:inv)))

  try {
    await updateInvitation(id,{ isUsed: !currentIsUsed});
    toast.success(
        `Código ${!currentIsUsed ? "deshabilitado (marcado como usado)" : "reactivado"} con éxito`
      );
  } catch (error) {
    setInvitations((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, isUsed: currentIsUsed } : inv))
      );
      toast.error("No se pudo actualizar el estado en el servidor");
    }
  };

  const handleDeleteInvitation= async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este código? Esta acción no se puede deshacer.")) {
      return;
    }
    try {
      await deleteInvitation(id);
      
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
      toast.success("Código de invitación eliminado correctamente");
    } catch (error) {
      toast.error("Error al intentar eliminar el código");
    }
  }

return (
  <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* Encabezado con Botón a la derecha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Gestión de Accesos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Genera y administra los tokens de acceso de un solo uso para el registro de nuevos profesores.
          </p>
        </div>
        
        <Button
          onClick={handleGenerateCode}
          disabled={isGenerating}
          // Cambiamos 'bg-indigo-600 text-white' por las variables de tu tema
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-all whitespace-nowrap"
        >
          {isGenerating ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {isGenerating ? "Generando..." : "Generar Código"}
        </Button>
      </div>

      {/* Banner emergente que muestra el código recién generado */}
      {generatedCode && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900/50 shadow-sm animate-in slide-in-from-top-2">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-sm font-semibold text-green-800 dark:text-green-400">
                ¡Código generado exitosamente!
              </p>
              <p className="text-xs text-green-600 dark:text-green-500">
                Cópialo y compártelo. Este código ya aparece activo en tu tabla inferior.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-green-200 dark:border-green-800/50 min-w-[200px]">
              <code className="text-lg font-mono font-bold tracking-wider text-green-700 dark:text-green-400 flex-1 text-center">
                {generatedCode}
              </code>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopyCode}
                className="h-8 w-8 hover:bg-green-100 dark:hover:bg-green-900/50"
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-green-600" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenedor de la Tabla que ahora ocupa todo el ancho */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm w-full">
        <CardContent className="p-6">
          <InvitationTable
            invitations={invitations}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onToggleIsUsed={handleToggleIsUsed}
            onDelete={handleDeleteInvitation}
          />
        </CardContent>
      </Card>

    </div>
);
}