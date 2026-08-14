import LanguageForm from "@/components/LanguageForm"
import LanguageTable from "@/components/LanguageTable"
import { Button } from "@/components/ui/button"
import { getAllLanguages } from "@/service/LanguageService";
import { Plus } from "lucide-react"
import { useCallback, useEffect, useState } from "react";
import type { LanguageResponse } from "@/types/response/LanguageResponse";
import { deleteLanguage } from "@/service/LanguageService";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function Language (){
  const [showForm, setShowForm] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<LanguageResponse | null>(null);
  const [languages, setLanguages] = useState<LanguageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchLanguages = useCallback(async () => {
    try {
      const data = await getAllLanguages();
      setLanguages(data);
    } catch (error) {
      logger.error("Error cargando lenguajes", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteLanguage(deleteId);
      setLanguages((prevLanguages) => prevLanguages.filter((lang) => lang.id !== deleteId));
      toast.success("Lenguaje eliminado correctamente");
    } catch (error) {
      logger.error("Error al eliminar:", error);
      toast.error("No se pudo eliminar el lenguaje");
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (lang: LanguageResponse) => {
    setEditingLanguage(lang);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingLanguage(null);
    fetchLanguages();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingLanguage(null);
  };

  const handleNewLanguage = () => {
    setEditingLanguage(null);
    setShowForm(true);
  };

  return (
    <div className="p-6 bg-background text-foreground min-h-screen">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Lenguajes</h2>

        <Button
          onClick={handleNewLanguage}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-border rounded-md transition-colors hover:bg-muted"
        >
          <Plus className="w-3.5 h-3.5 fill-current" />
          Add New Language
        </Button>
      </div>

      {showForm && (
        <div className="mb-8">
          <LanguageForm
            language={editingLanguage}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      <div className={`flex flex-col gap-4 ${showForm ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
        <LanguageTable
          languages={languages}
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Eliminar Lenguaje"
        description="¿Estás seguro de que deseas eliminar este entorno? Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
      />
    </div>
  )
}
