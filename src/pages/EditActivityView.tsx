import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Save } from "lucide-react";

import { getActivitiesById, updateActivity } from "@/service/ActivityService";
import { getAllLanguages } from "@/service/LanguageService";
import type { UpdateActivityRequest } from "@/types/request/UpdateActivityRequest";
import type { EditorLanguage } from "@/types/EditorProps";
import EditorComponent from "@/components/EditorComponent";
import type { SubjectResponse } from "@/types/response/SubjectResponse";
import { getSubjectById } from "@/service/SubjectService";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { encodeToBase64, decodeFromBase64 } from "@/utils/base64.util";
import { logger } from "@/lib/logger";
import { ActivityConfigCards } from "@/components/ActivityConfigCards";



export default function EditActivityView() {
  // Obtenemos AMBOS parámetros de la URL
  const { id: subjectId, activityId } = useParams<{ id: string, activityId: string }>();
  const navigate = useNavigate();

  const [editorLanguages, setEditorLanguages] = useState<EditorLanguage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [subject, setSubject] = useState<SubjectResponse | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    languageId: 1, 
    maxAttempts: "0",
    allowCopy: true,
    allowPaste: true,
    starterCode: "", 
  });

  // Cargar datos al montar
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!activityId) return;

      const numericSubjectId = Number(subjectId);
      try {
        setIsLoading(true);
        // Pedimos los lenguajes y la información de LA actividad en paralelo
        const [langsData, activityData, subjectData] = await Promise.all([
          getAllLanguages(),
          getActivitiesById(activityId),
          getSubjectById(numericSubjectId)
        ]);
        

        // Mapeamos lenguajes
        const mappedLangs = langsData.map(lang => ({
          id: lang.id,
          name: `${lang.name} (${lang.version})`,
          monacoId: lang.editorIdentifier
        }));
        setEditorLanguages(mappedLangs);
        setSubject(subjectData);

        // Extraemos el código inicial si existe (es un array en la BD)
        let initialCodeStr = "";
        if (activityData.starterCode && activityData.starterCode.length > 0) {
          try {
            initialCodeStr = decodeFromBase64(activityData.starterCode[0].content);
          } catch (e) {
            logger.error("No se pudo extraer el starterCode:", e);
          }
        }

        // Poblamos el formulario con los datos que llegaron del backend
        setFormData({
          title: activityData.title,
          description: activityData.description || "",
          languageId: activityData.languageId,
          maxAttempts: activityData.maxAttempts.toString(),
          allowCopy: activityData.allowCopy,
          allowPaste: activityData.allowPaste,
          starterCode: initialCodeStr,
        });

      } catch (error) {
        logger.error("Error al cargar la actividad:", error);
        navigate(`/subject/${subjectId}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [activityId, subjectId, navigate]);

  const handleUpdate = async () => {
    if (!formData.title || !activityId) return;

    try {
      setIsSaving(true);
      
      const payload: UpdateActivityRequest = {
        title: formData.title,
        description: formData.description,
        maxAttempts: Number(formData.maxAttempts) || 0,
        allowCopy: formData.allowCopy,
        allowPaste: formData.allowPaste,
        starterCode: formData.starterCode ? [{
          name: "main",
          content: encodeToBase64(formData.starterCode)
        }] : undefined
      };

      // Actualizamos vía API
      await updateActivity(activityId, payload);
      navigate(`/subject/${subjectId}`);
      
    } catch (error) {
      logger.error("Error al actualizar la actividad:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-[calc(100vh-2rem)] justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  // --- El JSX es casi idéntico al de crear ---
  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] bg-background">
      <div className="flex-none p-6 pb-4 border-b border-border">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/course">Cursos</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/subject/${subjectId}`}>{subject?.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{formData.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {/* ... Breadcrumb (cambia "Crear" por "Editar") ... */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate(`/subject/${subjectId}`)}><ArrowLeft className="w-4 h-4" /></Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Editar Actividad</h1>
              <p className="text-muted-foreground text-sm">Actualiza los detalles y restricciones.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(`/subject/${subjectId}`)}>Cancelar</Button>
            <Button className="gap-2" onClick={handleUpdate} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Actualizar Cambios
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden p-6 gap-6 pt-6">
        <div className="w-[350px] flex-none flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
          <ActivityConfigCards
            title={formData.title}
            description={formData.description}
            allowCopy={formData.allowCopy}
            allowPaste={formData.allowPaste}
            maxAttempts={formData.maxAttempts}
            onTitleChange={(v) => setFormData(prev => ({ ...prev, title: v }))}
            onDescriptionChange={(v) => setFormData(prev => ({ ...prev, description: v }))}
            onAllowCopyChange={(v) => setFormData(prev => ({ ...prev, allowCopy: v }))}
            onAllowPasteChange={(v) => setFormData(prev => ({ ...prev, allowPaste: v }))}
            onMaxAttemptsChange={(v) => setFormData(prev => ({ ...prev, maxAttempts: v }))}
          />
        </div>

        <div className="flex-1 border rounded-xl overflow-hidden bg-background shadow-sm flex flex-col">
          <EditorComponent 
            languages={editorLanguages}
            // Importante: Pasamos el código y el lenguaje inicial para que el editor inicie con lo guardado
            initialCode={{ id: "1", nameFile: "main", code: formData.starterCode, languageId: formData.languageId }}
            onChangeCode={(code) => setFormData(prev => ({ ...prev, starterCode: code }))}
            onChangeLanguage={(id) => setFormData(prev => ({ ...prev, languageId: id }))}
          />
        </div>
      </div>
    </div>
  );
}