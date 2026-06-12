import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { createActivity } from "@/service/ActivityService";
import { getAllLanguages } from "@/service/LanguageService";
import type { CreateActivityRequest } from "@/types/request/CreateActivityRequest";
import type { EditorLanguage } from "@/types/EditorProps";

import EditorComponent from "@/components/EditorComponent";
import type { SubjectResponse } from "@/types/response/SubjectResponse";
import { getSubjectById } from "@/service/SubjectService";
import { encodeToBase64 } from "@/utils/base64.util";


export default function CreateActivityView() {
  const { id: subjectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
    starterCode: "", 
  });

useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const data = await getAllLanguages();
        //setLanguages(data);
        
        const subjectNameId = Number(subjectId)
        const subjectData = await getSubjectById(subjectNameId);
        setSubject(subjectData)
        const mappedLangs: EditorLanguage[] = data.map(lang => ({
          id: lang.id,
          name: `${lang.name} (${lang.version})`,
          monacoId: lang.editorIdentifier 
        }));
        
        setEditorLanguages(mappedLangs);
        
        if (mappedLangs.length > 0) {
          setFormData(prev => ({ ...prev, languageId: mappedLangs[0].id }));
        }
      } catch (error) {
        console.error("Error al cargar lenguajes:", error);
      } finally {
        setIsLoadingLanguages(false);
      }
    };
    fetchLanguages();
  }, []);

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
        starterCode: formData.starterCode ? [{
          name: "main", 
          content: encodeToBase64(formData.starterCode)
        }] : undefined
      };

      await createActivity(payload);
      navigate(`/subject/${subjectId}`);
      
    } catch (error) {
      console.error("Error al guardar la actividad:", error);
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
              <BreadcrumbPage>Crear Actividad</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate(`/subject/${subjectId}`)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Nueva Actividad</h1>
              <p className="text-muted-foreground text-sm">Configura los detalles y el código inicial para el alumno.</p>
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
          
          <Card className="dark:bg-zinc-900/50 dark:border-zinc-800 shadow-sm shrink-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título <span className="text-destructive">*</span></Label>
                <Input 
                  id="title" 
                  placeholder="Ej. Suma de Matrices"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Instrucciones</Label>
                <Textarea 
                  id="description" 
                  placeholder="Escribe el planteamiento del problema..."
                  className="min-h-[140px] resize-y"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-zinc-900/50 dark:border-zinc-800 shadow-sm shrink-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Restricciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium cursor-pointer" htmlFor="allow-copy">Permitir Copiar</Label>
                <Switch id="allow-copy" checked={formData.allowCopy} onCheckedChange={(val) => setFormData(prev => ({...prev, allowCopy: val}))} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium cursor-pointer" htmlFor="allow-paste">Permitir Pegar</Label>
                <Switch id="allow-paste" checked={formData.allowPaste} onCheckedChange={(val) => setFormData(prev => ({...prev, allowPaste: val}))} />
              </div>
              <div className="space-y-2 pt-4 border-t border-border">
                <Label htmlFor="maxAttempts">Intentos de Compilación Máximos</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    id="maxAttempts" 
                    type="number" 
                    min="0"
                    className="w-24"
                    value={formData.maxAttempts}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxAttempts: e.target.value }))}
                  />
                  <span className="text-xs text-muted-foreground">0 = Ilimitados</span>
                </div>
              </div>
            </CardContent>
          </Card>
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
              onChangeCode={(code) => setFormData(prev => ({ ...prev, starterCode: code }))}
              onChangeLanguage={(id) => setFormData(prev => ({ ...prev, languageId: id }))}
            />
          )}
        </div>

      </div>
    </div>
  );
}