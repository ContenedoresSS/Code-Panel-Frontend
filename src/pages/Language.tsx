import LanguageForm from "@/components/LanguageForm"
import LanguageTable from "@/components/LanguageTable"
import { Button } from "@/components/ui/button"
import { getAllLanguages } from "@/service/LanguageService";
import { Plus } from "lucide-react"
import { useEffect, useState } from "react";
import type { LanguageResponse } from "@/types/response/LanguageResponse";
import { deleteLanguage } from "@/service/LanguageService";
import { toast } from "sonner";

export default function Language (){
  const [showForm, setShowForm] = useState(false);
  const [languages, setLanguages] = useState<LanguageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const fetchLanguages = async () => {
        try {
          const data = await getAllLanguages();
          setLanguages(data);
        } catch (error) {
          console.error("Error cargando lenguajes", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchLanguages();
    }, []);

  const handleDelete = async (id: number) => {
    const confirm = window.confirm("¿Estás seguro de que deseas eliminar este entorno? Esta acción no se puede deshacer.");
    if (!confirm) return;

    try {
      await deleteLanguage(id);
      setLanguages((prevLanguages) => prevLanguages.filter((lang) => lang.id !== id));

      toast.success("Lenguaje eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error("No se pudo eliminar el lenguaje");
    }
  };
    return(
    <div className="p-6 bg-background text-foreground min-h-screen">
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Lenguajes</h2>
        
        <Button 
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-border rounded-md transition-colors hover:bg-muted"
        >
        <Plus className="w-3.5 h-3.5 fill-current" /> 
        Add New Language
        </Button>
      </div>

      {showForm && (
        <div className="mb-8">
          <LanguageForm /> 
        </div>
      )}

      <div className={`flex flex-col gap-4 ${showForm ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <LanguageTable 
            languages={languages} 
            isLoading={isLoading} 
            onDelete={handleDelete}
            onEdit={(lang) => console.log("Editar", lang)}
          />
        </div>
    </div>
    )
}