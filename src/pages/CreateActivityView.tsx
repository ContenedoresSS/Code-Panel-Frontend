import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { createActivity, getActivitiesById } from "@/service/ActivityService";
import { getAllLanguages } from "@/service/LanguageService";
import type { CreateActivityRequest } from "@/types/request/CreateActivityRequest";
import type { EditorLanguage } from "@/types/EditorProps";

import EditorComponent from "@/components/EditorComponent";
import { ActivityConfigCards } from "@/components/ActivityConfigCards";
import type { SubjectResponse } from "@/types/response/SubjectResponse";
import { getSubjectById } from "@/service/SubjectService";
import { encodeToBase64, decodeFromBase64 } from "@/utils/base64.util";
import { logger } from "@/lib/logger";


export default function CreateActivityView() {
  const { id: subjectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get("duplicate");

  //const [languages, setLanguages] = useState<LanguageResponse[]>([]);
  const [editorLanguages, setEditorLanguages] = useState<EditorLanguage[]>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [subject, setSubject] = useState<SubjectResponse | null>(null);

  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    languageId: 1, 
    maxAttempts: "0",
    allowCopy: true,
    allowPaste: true,
    allowEdit: true,
    allowLanguageChange: true,
    allowUpload: true,
    allowDownload: true,
    starterCode: "", 
  });

useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await getAllLanguages();
        
        const subjectNameId = Number(subjectId)
        const subjectData = await getSubjectById(subjectNameId);
        setSubject(subjectData)
        const mappedLangs: EditorLanguage[] = data.map(lang => ({
          id: lang.id,
          name: `${lang.name} (${lang.version})`,
          monacoId: lang.editorIdentifier,
          fileExtension: lang.fileExtension,
        }));
        
        setEditorLanguages(mappedLangs);

        if (duplicateId) {
          const originalActivity = await getActivitiesById(duplicateId);
          let starterCodeStr = "";
          if (originalActivity.starterCode && originalActivity.starterCode.length > 0) {
            try {
              starterCodeStr = decodeFromBase64(originalActivity.starterCode[0].content);
            } catch (e) {
              logger.error("Error decodificando starterCode:", e);
            }
          }
          setFormData({
            title: `Copia de ${originalActivity.title}`,
            description: originalActivity.description || "",
            languageId: originalActivity.languageId,
            maxAttempts: originalActivity.maxAttempts.toString(),
            allowCopy: originalActivity.allowCopy,
            allowPaste: originalActivity.allowPaste,
            allowEdit: originalActivity.allowEdit,
            allowLanguageChange: originalActivity.allowLanguageChange,
            allowUpload: originalActivity.allowUpload,
            allowDownload: originalActivity.allowDownload,
            starterCode: starterCodeStr,
          });
        } else if (mappedLangs.length > 0) {
          setFormData(prev => ({ ...prev, languageId: mappedLangs[0].id }));
        }
      } catch (error) {
        logger.error("Error al cargar datos:", error);
      } finally {
        setIsLoadingLanguages(false);
      }
    };
    fetchInitialData();
  }, [subjectId, duplicateId]);

  const handleSave = async () => {
    if (!formData.title || !subjectId) return;

    try {
      setIsSaving(true);
      
      const payload: CreateActivityRequest = {
        subjectId: Number(subjectId),
        languageId: formData.languageId,
        title: formData.title,
        description: formData.description,
        maxAttempts: Number(formData.maxAttempts) || 0,
        allowCopy: formData.allowCopy,
        allowPaste: formData.allowPaste,
        allowEdit: formData.allowEdit,
        allowLanguageChange: formData.allowLanguageChange,
        allowUpload: formData.allowUpload,
        allowDownload: formData.allowDownload,
        starterCode: formData.starterCode ? [{
          name: "main", 
          content: encodeToBase64(formData.starterCode)
        }] : undefined
      };

      await createActivity(payload);
      navigate(`/subject/${subjectId}`);
      
    } catch (error) {
      logger.error("Error al guardar la actividad:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (

    <div className="flex flex-col h-[calc(100vh-2rem)] bg-background">
      
      {/* 1. Encabezado Superior (Fijo) */}
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
              <BreadcrumbPage>{duplicateId ? "Duplicar Actividad" : "Crear Actividad"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate(`/subject/${subjectId}`)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {duplicateId ? "Duplicar Actividad" : "Nueva Actividad"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {duplicateId 
                  ? "Modifica los detalles de la copia antes de guardarla." 
                  : "Configura los detalles y el código inicial para el alumno."
                }
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={() => navigate(`/subject/${subjectId}`)}>
              Cancelar
            </Button>
            <Button 
              className="gap-2" 
              onClick={handleSave} 
              disabled={!formData.title || !formData.languageId || isSaving}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Actividad
            </Button>
          </div>
        </div>
      </div>


      {/* El min-h-0 y overflow-hidden son la magia para que el editor no desborde la pantalla */}
      <div className="flex flex-1 min-h-0 overflow-hidden p-6 gap-6 pt-6">
        
        {/* COLUMNA IZQUIERDA: Panel de Configuraciones (Scrollable) */}
        <div className="w-[350px] xl:w-[400px] flex-none flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
          
          <ActivityConfigCards
            title={formData.title}
            description={formData.description}
            allowCopy={formData.allowCopy}
            allowPaste={formData.allowPaste}
            allowEdit={formData.allowEdit}
            allowLanguageChange={formData.allowLanguageChange}
            allowUpload={formData.allowUpload}
            allowDownload={formData.allowDownload}
            maxAttempts={formData.maxAttempts}
            onTitleChange={(v) => setFormData(prev => ({ ...prev, title: v }))}
            onDescriptionChange={(v) => setFormData(prev => ({ ...prev, description: v }))}
            onAllowCopyChange={(v) => setFormData(prev => ({ ...prev, allowCopy: v }))}
            onAllowPasteChange={(v) => setFormData(prev => ({ ...prev, allowPaste: v }))}
            onAllowEditChange={(v) => setFormData(prev => ({ ...prev, allowEdit: v }))}
            onAllowLanguageChangeChange={(v) => setFormData(prev => ({ ...prev, allowLanguageChange: v }))}
            onAllowUploadChange={(v) => setFormData(prev => ({ ...prev, allowUpload: v }))}
            onAllowDownloadChange={(v) => setFormData(prev => ({ ...prev, allowDownload: v }))}
            onMaxAttemptsChange={(v) => setFormData(prev => ({ ...prev, maxAttempts: v }))}
          />
        </div>

        {/* COLUMNA DERECHA: El Editor (Ocupa todo el espacio restante) */}
        <div className="flex-1 border rounded-xl overflow-hidden bg-background shadow-sm flex flex-col">
          {isLoadingLanguages ? (
            <div className="flex-1 flex flex-col justify-center items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Cargando entorno...</span>
            </div>
          ) : (
            <EditorComponent 
              languages={editorLanguages}
              initialCode={{ id: "1", nameFile: "main", code: formData.starterCode, languageId: formData.languageId }}
              onChangeCode={(code) => setFormData(prev => ({ ...prev, starterCode: code }))}
              onChangeLanguage={(id) => setFormData(prev => ({ ...prev, languageId: id }))}
            />
          )}
        </div>

      </div>
    </div>
  );
}