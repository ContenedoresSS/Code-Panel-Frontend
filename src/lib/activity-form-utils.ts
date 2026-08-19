import type { LanguageResponse } from "@/types/response/LanguageResponse";
import type { EditorFile, EditorLanguage } from "@/types/EditorProps";
import type { ActivityResponse } from "@/types/response/ActivityResponse";
import type { ActivityRules } from "@/types/request/CreateActivityRequest";
import { decodeFromBase64 } from "@/utils/base64.util";
import { toCodeFiles } from "@/lib/editor-files.util";

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
  starterCode: EditorFile[];
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
  starterCode: [],
};

export function mapApiLanguagesToEditorLanguages(languages: LanguageResponse[]): EditorLanguage[] {
  return languages.map((lang) => ({
    id: lang.id,
    name: `${lang.name} (${lang.version})`,
    monacoId: lang.editorIdentifier,
    fileExtension: lang.fileExtension,
  }));
}

export function extractStarterFiles(activity: ActivityResponse): EditorFile[] {
  if (!activity.starterCode || activity.starterCode.length === 0) return [];
  return activity.starterCode
    .map((file, index) => ({
      id: String(index + 1),
      nameFile: file.name,
      code: decodeFromBase64(file.content),
      languageId: activity.languageId,
    }))
    .filter((file) => file.code !== "");
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
    starterCode: extractStarterFiles(activity),
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

function buildStarterCode(files: EditorFile[]) {
  return files.length > 0 ? toCodeFiles(files) : undefined;
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
