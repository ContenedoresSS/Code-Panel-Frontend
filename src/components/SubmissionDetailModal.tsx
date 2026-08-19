import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileCode2 } from "lucide-react";
import { getSubmissionDetail } from "@/service/ActivityService";
import { getAllLanguages } from "@/service/LanguageService";
import { decodeFromBase64 } from "@/utils/base64.util";
import { escapeHtml } from "@/utils/sanitize.util";
import { logger } from "@/lib/logger";
import type { SubmissionDetail } from "@/types/response/SubmissionDetail";
import type { SubmissionStatus } from "@/types/response/EvaluationResult";

const STATUS_LABELS: Record<SubmissionStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ACCEPTED: { label: "Aceptado", variant: "default" },
  WRONG_ANSWER: { label: "Respuesta incorrecta", variant: "secondary" },
  COMPILE_ERROR: { label: "Error de compilación", variant: "destructive" },
  RUNTIME_ERROR: { label: "Error en ejecución", variant: "destructive" },
  TIME_LIMIT_EXCEEDED: { label: "Tiempo excedido", variant: "destructive" },
  PENDING: { label: "Pendiente", variant: "outline" },
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

interface SubmissionDetailModalProps {
  open: boolean;
  onClose: () => void;
  activityId: string;
  submissionId: string;
  studentName?: string;
  languageName?: string;
}

export function SubmissionDetailModal({
  open,
  onClose,
  activityId,
  submissionId,
  studentName,
  languageName,
}: SubmissionDetailModalProps) {
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [fallbackLanguages, setFallbackLanguages] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async (actId: string, subId: string) => {
    setIsLoading(true);
    setError(null);
    setDetail(null);

    try {
      const [detailData, languages] = await Promise.all([
        getSubmissionDetail(actId, subId),
        getAllLanguages().catch(() => []),
      ]);
      setDetail(detailData);
      setFallbackLanguages(
        languages.map((lang) => ({ id: lang.id, name: `${lang.name} (${lang.version})` }))
      );
    } catch (err) {
      logger.error("Error al cargar el detalle del envío:", err);
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "No se pudo cargar el detalle del envío."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open || !activityId || !submissionId) return;
    loadDetail(activityId, submissionId);
  }, [open, activityId, submissionId, loadDetail]);

  const resolvedLanguageName =
    detail?.languageName ||
    languageName ||
    fallbackLanguages.find((l) => l.id === detail?.languageId)?.name ||
    `Lenguaje ${detail?.languageId ?? ""}`;

  const status = detail ? (STATUS_LABELS[detail.status] ?? STATUS_LABELS.PENDING) : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-6">
            <div>
              <DialogTitle>Detalle del envío</DialogTitle>
              {studentName && (
                <DialogDescription className="text-sm">
                  {studentName} · {formatDate(detail?.submittedAt ?? "")}{" "}
                  {formatTime(detail?.submittedAt ?? "")}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center py-16 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : detail ? (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <DetailItem label="Estado">
                {status && (
                  <Badge variant={status.variant} className="text-xs">
                    {status.label}
                  </Badge>
                )}
              </DetailItem>
              <DetailItem label="Calificación">
                <span className="text-sm font-semibold">
                  {detail.finalGrade !== null ? `${detail.finalGrade}%` : "—"}
                </span>
              </DetailItem>
              <DetailItem label="Lenguaje">
                <span className="text-sm font-medium">{resolvedLanguageName}</span>
              </DetailItem>
              <DetailItem label="Casos de prueba">
                <span className="text-sm font-medium">
                  {detail.passedTests}/{detail.totalTests}
                </span>
              </DetailItem>
              <DetailItem label="Tiempo">
                <span className="text-sm font-medium">
                  {detail.executionTimeMs !== null ? `${detail.executionTimeMs} ms` : "—"}
                </span>
              </DetailItem>
              <DetailItem label="Fecha y hora">
                <span className="text-sm font-medium">
                  {formatDate(detail.submittedAt)} {formatTime(detail.submittedAt)}
                </span>
              </DetailItem>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Código enviado
              </h3>
              {detail.codeSnapshot.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin código en el envío.</p>
              ) : (
                <div className="space-y-2">
                  {detail.codeSnapshot.map((file) => (
                    <div
                      key={file.name}
                      className="border border-border rounded-md overflow-hidden bg-muted/20"
                    >
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/40">
                        <FileCode2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold font-mono">{file.name}</span>
                      </div>
                      <pre className="p-3 text-xs font-mono text-foreground whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                        {escapeHtml(decodeFromBase64(file.content)) || "(vacío)"}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Salida del programa
              </h3>
              {detail.stdout !== null && detail.stdout !== undefined ? (
                <pre className="p-3 border border-border rounded-md bg-muted/20 text-xs font-mono text-foreground whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                  {escapeHtml(detail.stdout) || "(sin salida)"}
                </pre>
              ) : detail.compilerOutput ? (
                <pre className="p-3 border border-border rounded-md bg-red-500/10 text-xs font-mono text-red-500 whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                  {escapeHtml(detail.compilerOutput)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">Sin errores.</p>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-muted/20 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export default SubmissionDetailModal;
