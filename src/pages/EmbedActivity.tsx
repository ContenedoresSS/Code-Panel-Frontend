import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { Loader2 } from "lucide-react";
import EditorComponent from "@/components/EditorComponent";
import { EmbedLoginForm } from "@/components/EmbedLoginForm";
import { useAuth } from "@/assets/context/AuthContext";
import { getWorkspace } from "@/service/ActivityService";
import { getAllLanguages } from "@/service/LanguageService";
import { decodeFromBase64 } from "@/utils/base64.util";
import type { EditorCodeFile, EditorLanguage } from "@/types/EditorProps";
import type { WorkspaceResponse } from "@/types/response/WorkspaceResponse";
import { logger } from "@/lib/logger";

export default function EmbedActivity() {
  const { activityId } = useParams<{ activityId: string }>();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [allLanguages, setAllLanguages] = useState<EditorLanguage[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !activityId) return;

    setIsLoadingWorkspace(true);
    setWorkspaceError(null);

    Promise.all([
      getWorkspace(activityId),
      getAllLanguages(),
    ])
      .then(([workspaceData, languagesData]) => {
        setWorkspace(workspaceData);
        const mappedLangs: EditorLanguage[] = languagesData.map((lang) => ({
          id: lang.id,
          monacoId: lang.editorIdentifier,
          name: `${lang.name} (${lang.version})`,
          fileExtension: lang.fileExtension,
        }));
        setAllLanguages(mappedLangs);
      })
      .catch((err) => {
        logger.error("Error al cargar workspace:", err);
        setWorkspaceError(
          err?.response?.data?.error || "No se pudo cargar la actividad. Intenta de nuevo más tarde."
        );
      })
      .finally(() => setIsLoadingWorkspace(false));
  }, [isAuthenticated, activityId]);

  if (isAuthLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <EmbedLoginForm />;
  }

  if (isLoadingWorkspace) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando actividad...</p>
      </div>
    );
  }

  if (workspaceError) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-destructive">{workspaceError}</p>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Actividad no encontrada.</p>
      </div>
    );
  }

  const editorLanguage: EditorLanguage = useMemo(() => ({
    id: workspace.language.id,
    monacoId: workspace.language.editorIdentifier,
    name: workspace.language.name,
    fileExtension: workspace.language.fileExtension,
  }), [workspace.language.id, workspace.language.editorIdentifier, workspace.language.name, workspace.language.fileExtension]);

  const initialCode: EditorCodeFile | undefined = useMemo(() => {
    if (workspace.starterCode && workspace.starterCode.length > 0) {
      try {
        const decodedContent = decodeFromBase64(workspace.starterCode[0].content);
        return {
          id: "1",
          nameFile: workspace.starterCode[0].name,
          code: decodedContent,
          languageId: workspace.language.id,
        };
      } catch (e) {
        logger.error("Error decodificando starterCode:", e);
      }
    }
    return undefined;
  }, [workspace?.starterCode, workspace?.language?.id]);

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <header className="flex-shrink-0 border-b border-border px-4 py-3">
        <h1 className="text-sm font-bold truncate">{workspace.title}</h1>
        {workspace.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {workspace.description}
          </p>
        )}
      </header>

      <div className="flex-1 min-h-0">
        <EditorComponent
          languages={workspace.allowLanguageChange ? allLanguages : [editorLanguage]}
          initialCode={initialCode}
          disableCopy={!workspace.allowCopy}
          disablePaste={!workspace.allowPaste}
          disableEdit={!workspace.allowEdit}
          disableLanguageChange={!workspace.allowLanguageChange}
          disableUpload={!workspace.allowUpload}
          disableDownload={!workspace.allowDownload}
        />
      </div>
    </div>
  );
}
