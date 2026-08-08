import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { Loader2 } from "lucide-react";
import EditorComponent from "@/components/EditorComponent";
import { EmbedLoginForm } from "@/components/EmbedLoginForm";
import { useAuth } from "@/assets/context/AuthContext";
import { getWorkspace, submitSolution } from "@/service/ActivityService";
import { getAllLanguages } from "@/service/LanguageService";
import { decodeFromBase64, encodeToBase64 } from "@/utils/base64.util";
import type { EditorCodeFile, EditorLanguage } from "@/types/EditorProps";
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

  const initialCode: EditorCodeFile | undefined = useMemo(() => {
    if (!workspace?.starterCode || workspace.starterCode.length === 0) return undefined;
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
      return undefined;
    }
  }, [workspace]);

  useEffect(() => {
    if (!isAuthenticated || !activityId) return;

    setIsLoadingWorkspace(true);
    setWorkspaceError(null);

    Promise.all([
      getWorkspace(activityId),
      getAllLanguages().catch(() => []),
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

  const handleSubmit = async (code: string, languageId: number) => {
    if (!activityId) return;
    setIsSubmitting(true);
    setEvaluationResult(null);

    try {
      const result = await submitSolution(activityId, {
        files: [{ name: "main", content: encodeToBase64(code) }],
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
          languages={workspace.rules.allowLanguageChange ? allLanguages : [editorLanguage]}
          initialCode={initialCode}
          disableCopy={!workspace.rules.allowCopy}
          disablePaste={!workspace.rules.allowPaste}
          disableEdit={!workspace.rules.allowCodeEdit}
          disableLanguageChange={!workspace.rules.allowLanguageChange}
          disableUpload={!workspace.rules.allowFileUpload}
          disableDownload={!workspace.rules.allowFileDownload}
          testCases={workspace.testCases.filter(tc => !tc.isHidden)}
          maxAttempts={workspace.maxAttempts}
          onSubmit={handleSubmit}
          evaluationResult={evaluationResult}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
