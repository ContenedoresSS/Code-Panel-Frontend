import type { EditorLanguage } from "@/types/EditorProps";
import type { TestCase } from "@/types/response/TestCase";
import type { ActivityFormData } from "@/lib/activity-form-utils";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import EditorComponent from "@/components/EditorComponent";
import { ActivityConfigCards } from "@/components/ActivityConfigCards";
import { TestCaseManager } from "@/components/test-case/TestCaseManager";
import { TestCaseManagementModal } from "@/components/test-case/TestCaseManagementModal";

interface ActivityFormLayoutProps {
  subjectId: string;
  subjectName: string;
  breadcrumbLast: string;
  pageTitle: string;
  pageSubtitle: string;
  saveLabel: string;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  formData: ActivityFormData;
  onFieldChange: (field: keyof ActivityFormData, value: string | boolean | number) => void;
  editorLanguages: EditorLanguage[];
  isLoadingEditor: boolean;
  testCases: TestCase[];
  onTestCasesChange: (testCases: TestCase[]) => void;
  isTestCaseModalOpen: boolean;
  onOpenTestCaseModal: () => void;
  onCloseTestCaseModal: () => void;
  isFullPageLoading?: boolean;
}

export function ActivityFormLayout({
  subjectId,
  subjectName,
  breadcrumbLast,
  pageTitle,
  pageSubtitle,
  saveLabel,
  onCancel,
  onSave,
  isSaving,
  formData,
  onFieldChange,
  editorLanguages,
  isLoadingEditor,
  testCases,
  onTestCasesChange,
  isTestCaseModalOpen,
  onOpenTestCaseModal,
  onCloseTestCaseModal,
  isFullPageLoading,
}: ActivityFormLayoutProps) {
  if (isFullPageLoading) {
    return (
      <div className="flex h-[calc(100vh-2rem)] justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

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
              <BreadcrumbLink href={`/subject/${subjectId}`}>{subjectName}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{breadcrumbLast}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={onCancel}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {pageTitle}
              </h1>
              <p className="text-muted-foreground text-sm">{pageSubtitle}</p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              className="gap-2"
              onClick={onSave}
              disabled={!formData.title || !formData.languageId || isSaving}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saveLabel}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden p-6 gap-6 pt-6">
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
            onTitleChange={(v) => onFieldChange("title", v)}
            onDescriptionChange={(v) => onFieldChange("description", v)}
            onAllowCopyChange={(v) => onFieldChange("allowCopy", v)}
            onAllowPasteChange={(v) => onFieldChange("allowPaste", v)}
            onAllowEditChange={(v) => onFieldChange("allowEdit", v)}
            onAllowLanguageChangeChange={(v) => onFieldChange("allowLanguageChange", v)}
            onAllowUploadChange={(v) => onFieldChange("allowUpload", v)}
            onAllowDownloadChange={(v) => onFieldChange("allowDownload", v)}
            onMaxAttemptsChange={(v) => onFieldChange("maxAttempts", v)}
          />

          <TestCaseManager
            testCases={testCases}
            onOpenManagement={onOpenTestCaseModal}
          />
        </div>

        <div className="flex-1 border rounded-xl overflow-hidden bg-background shadow-sm flex flex-col">
          {isLoadingEditor ? (
            <div className="flex-1 flex flex-col justify-center items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Cargando entorno...</span>
            </div>
          ) : (
            <EditorComponent
              languages={editorLanguages}
              initialCode={{ id: "1", nameFile: "main", code: formData.starterCode, languageId: formData.languageId }}
              onChangeCode={(code) => onFieldChange("starterCode", code)}
              onChangeLanguage={(id) => onFieldChange("languageId", id)}
              onAddTestCase={onOpenTestCaseModal}
            />
          )}
        </div>

        <TestCaseManagementModal
          open={isTestCaseModalOpen}
          onClose={onCloseTestCaseModal}
          testCases={testCases}
          onChange={onTestCasesChange}
          currentCode={formData.starterCode}
          languageId={formData.languageId}
        />
      </div>
    </div>
  );
}

export default ActivityFormLayout;
