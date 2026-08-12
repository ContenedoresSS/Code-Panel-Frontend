import type { LanguageResponse } from "@/types/response/LanguageResponse";
import type { EditorLanguage } from "@/types/EditorProps";
import type { ActivityResponse } from "@/types/response/ActivityResponse";
import type { ActivityRules } from "@/types/request/CreateActivityRequest";
import { decodeFromBase64, encodeToBase64 } from "@/utils/base64.util";
import { logger } from "@/lib/logger";

export interface ActivityFormData {
  title: string;
  description: string;
  languageId: number;
  maxAttempts: string;
  allowCopy: boolean;
  allowPaste: boolean;
  allowEdit: boolean;
  allowLanguageChange: boolean;
  allowUpload: boolean;
  allowDownload: boolean;
  starterCode: string;
}

export const DEFAULT_FORM_DATA: ActivityFormData = {
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
};

export function mapApiLanguagesToEditorLanguages(languages: LanguageResponse[]): EditorLanguage[] {
  return languages.map((lang) => ({
    id: lang.id,
    name: `${lang.name} (${lang.version})`,
    monacoId: lang.editorIdentifier,
    fileExtension: lang.fileExtension,
  }));
}

export function extractStarterCode(activity: ActivityResponse): string {
  if (!activity.starterCode || activity.starterCode.length === 0) return "";
  try {
    return decodeFromBase64(activity.starterCode[0].content);
  } catch (e) {
    logger.error("Error decodificando starterCode:", e);
    return "";
  }
}

export function populateFormFromActivity(activity: ActivityResponse): ActivityFormData {
  return {
    title: activity.title,
    description: activity.description || "",
    languageId: activity.languageId,
    maxAttempts: activity.maxAttempts.toString(),
    allowCopy: activity.rules.allowCopy,
    allowPaste: activity.rules.allowPaste,
    allowEdit: activity.rules.allowCodeEdit,
    allowLanguageChange: activity.rules.allowLanguageChange,
    allowUpload: activity.rules.allowFileUpload,
    allowDownload: activity.rules.allowFileDownload,
    starterCode: extractStarterCode(activity),
  };
}

function buildActivityRules(formData: ActivityFormData): ActivityRules {
  return {
    allowCopy: formData.allowCopy,
    allowPaste: formData.allowPaste,
    allowCodeEdit: formData.allowEdit,
    allowLanguageChange: formData.allowLanguageChange,
    allowFileUpload: formData.allowUpload,
    allowFileDownload: formData.allowDownload,
  };
}

function buildStarterCode(code: string) {
  return code ? [{ name: "main", content: encodeToBase64(code) }] : undefined;
}

export function buildActivityPayload(formData: ActivityFormData) {
  return {
    title: formData.title,
    description: formData.description || undefined,
    languageId: formData.languageId,
    maxAttempts: Number(formData.maxAttempts) || 0,
    rules: buildActivityRules(formData),
    starterCode: buildStarterCode(formData.starterCode),
  };
}
