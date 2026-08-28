import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import { Loader2, LogIn } from "lucide-react";
import EditorComponent from "@/components/EditorComponent";
import { EmbedLoginForm } from "@/components/EmbedLoginForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/assets/context/useAuth";
import { getWorkspace, submitSolution } from "@/service/ActivityService";
import { getAllLanguages } from "@/service/LanguageService";
import { decodeFromBase64 } from "@/utils/base64.util";
import type { EditorFile, EditorLanguage } from "@/types/EditorProps";
import type { CodeFile } from "@/types/CodeFile";
import type { WorkspaceResponse } from "@/types/response/WorkspaceResponse";
import type { EvaluationResult } from "@/types/response/EvaluationResult";
import { logger } from "@/lib/logger";

export default function EmbedActivity() {
  const { activityId } = useParams<{ activityId: string }>();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [allLanguages, setAllLanguages] = useState<EditorLanguage[]>([]);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const workspaceLoaded = useRef(false);

  const editorLanguage: EditorLanguage = useMemo(() => {
    if (!workspace) {
      return { id: 0, monacoId: "", name: "", fileExtension: "" };
    }
    const langFromList = allLanguages.find(l => l.id === workspace.language.id);
    return {
      id: workspace.language.id,
      monacoId: langFromList?.monacoId ?? "",
      name: workspace.language.name,
      fileExtension: langFromList?.fileExtension ?? workspace.language.fileExtension ?? "",
    };
  }, [workspace, allLanguages]);

  const initialFiles: EditorFile[] | undefined = useMemo(() => {
    if (!workspace?.starterCode || workspace.starterCode.length === 0) return undefined;
    try {
      return workspace.starterCode.map((file, index) => ({
        id: String(index + 1),
        nameFile: file.name,
        code: decodeFromBase64(file.content),
        languageId: workspace.language.id,
      }));
    } catch (e) {
      logger.error("Error decodificando starterCode:", e);
      return undefined;
    }
  }, [workspace]);

  useEffect(() => {
    if (!activityId || (!isAuthenticated && !guestMode)) return;

    const loadLanguages = async () => {
      const languagesData = await getAllLanguages().catch(() => []);
      const mappedLangs: EditorLanguage[] = languagesData.map((lang) => ({
        id: lang.id,
        monacoId: lang.editorIdentifier,
        name: `${lang.name} (${lang.version})`,
        fileExtension: lang.fileExtension,
      }));
      setAllLanguages(mappedLangs);
    };

    if (workspaceLoaded.current) {
      if (isAuthenticated) loadLanguages();
      return;
    }

    setIsLoadingWorkspace(true);
    setWorkspaceError(null);

    getWorkspace(activityId)
      .then(async (workspaceData) => {
        setWorkspace(workspaceData);
        workspaceLoaded.current = true;
        if (isAuthenticated) {
          await loadLanguages();
        } else {
          setAllLanguages([]);
        }
      })
      .catch((err) => {
        logger.error("Error al cargar workspace:", err);
        setWorkspaceError(
          err?.response?.data?.error || "No se pudo cargar la actividad. Intenta de nuevo más tarde."
        );
      })
      .finally(() => setIsLoadingWorkspace(false));
  }, [isAuthenticated, activityId, guestMode]);

  const handleGuestLogin = () => {
    setGuestMode(false);
    setEvaluationResult(null);
  };

  const handleSubmit = async (files: CodeFile[], languageId: number) => {
    if (!activityId) return;
    setIsSubmitting(true);
    setEvaluationResult(null);

    try {
      const result = await submitSolution(activityId, {
        files,
        languageId,
      });
      setEvaluationResult(result);
    } catch (err: unknown) {
      logger.error("Error al enviar solución:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated && !guestMode && !workspace) {
    return <EmbedLoginForm onGuestMode={() => setGuestMode(true)} />;
  }

  if (isLoadingWorkspace && !workspace) {
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

  return (
    <div className="relative flex flex-col h-full min-h-screen w-full bg-background">
      <header className="flex-shrink-0 border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-sm font-bold truncate">{workspace.title}</h1>
            {workspace.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {workspace.description}
              </p>
            )}
          </div>
          {guestMode && !evaluationResult && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-2"
              onClick={handleGuestLogin}
            >
              <LogIn className="h-4 w-4" />
              Iniciar sesión
            </Button>
          )}
        </div>
      </header>

      {guestMode && evaluationResult && (
        <div className="flex-shrink-0 flex items-center justify-between gap-3 border-b border-border bg-amber-500/10 px-4 py-2">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            No iniciaste sesión: tu envío se evaluó, pero <strong>no se guardó</strong> en la
            plataforma.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-2"
            onClick={handleGuestLogin}
          >
            <LogIn className="h-4 w-4" />
            Iniciar sesión para guardar
          </Button>
        </div>
      )}

      <div className="flex-1 min-h-0">
        <EditorComponent
          languages={!guestMode && workspace.rules.allowLanguageChange ? allLanguages : [editorLanguage]}
          initialFiles={initialFiles}
          disableCopy={!workspace.rules.allowCopy}
          disablePaste={!workspace.rules.allowPaste}
          disableEdit={!workspace.rules.allowCodeEdit}
          disableLanguageChange={guestMode || !workspace.rules.allowLanguageChange}
          disableUpload={!workspace.rules.allowFileUpload}
          disableDownload={!workspace.rules.allowFileDownload}
          testCases={workspace.testCases.filter(tc => !tc.isHidden)}
          maxAttempts={workspace.maxAttempts}
          onSubmit={handleSubmit}
          evaluationResult={evaluationResult}
          isSubmitting={isSubmitting}
        />
      </div>

      {!isAuthenticated && !guestMode && workspace && (
        <div className="absolute inset-0 z-50 bg-background/90 backdrop-blur-sm overflow-y-auto">
          <EmbedLoginForm onGuestMode={() => setGuestMode(true)} />
        </div>
      )}
    </div>
  );
}
