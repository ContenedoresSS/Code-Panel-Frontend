import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { createActivity, getActivitiesById } from "@/service/ActivityService";
import { getAllLanguages } from "@/service/LanguageService";
import { getTestCases, createTestCase } from "@/service/TestCaseService";
import { getSubjectById } from "@/service/SubjectService";
import type { CreateActivityRequest } from "@/types/request/CreateActivityRequest";
import type { SubjectResponse } from "@/types/response/SubjectResponse";
import type { EditorLanguage, EditorFile } from "@/types/EditorProps";
import type { TestCase } from "@/types/response/TestCase";
import { logger } from "@/lib/logger";
import {
  DEFAULT_FORM_DATA,
  type ActivityFormData,
  mapApiLanguagesToEditorLanguages,
  populateFormFromActivity,
  buildActivityPayload,
} from "@/lib/activity-form-utils";
import { ActivityFormLayout } from "@/components/ActivityFormLayout";

export default function CreateActivityView() {
  const { id: subjectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get("duplicate");

  const [editorLanguages, setEditorLanguages] = useState<EditorLanguage[]>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [subject, setSubject] = useState<SubjectResponse | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isTestCaseModalOpen, setIsTestCaseModalOpen] = useState(false);
  const [formData, setFormData] = useState<ActivityFormData>(DEFAULT_FORM_DATA);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await getAllLanguages();
        const subjectNameId = Number(subjectId);
        const subjectData = await getSubjectById(subjectNameId);
        setSubject(subjectData);

        const mappedLangs = mapApiLanguagesToEditorLanguages(data);
        setEditorLanguages(mappedLangs);

        if (duplicateId) {
          const [originalActivity, testCasesData] = await Promise.all([
            getActivitiesById(duplicateId),
            getTestCases(duplicateId).catch(() => []),
          ]);
          setTestCases(testCasesData);
          setFormData({
            ...populateFormFromActivity(originalActivity),
            title: `Copia de ${originalActivity.title}`,
          });
        } else if (mappedLangs.length > 0) {
          setFormData((prev) => ({ ...prev, languageId: mappedLangs[0].id }));
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
        ...buildActivityPayload(formData),
        subjectId: Number(subjectId),
      };
      const createdActivity = await createActivity(payload);

      for (const tc of testCases) {
        await createTestCase(createdActivity.id, {
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
        });
      }

      navigate(`/subject/${subjectId}`);
    } catch (error) {
      logger.error("Error al guardar la actividad:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: keyof ActivityFormData, value: string | boolean | number | EditorFile[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ActivityFormLayout
      subjectId={subjectId!}
      subjectName={subject?.name ?? ""}
      breadcrumbLast={duplicateId ? "Duplicar Actividad" : "Crear Actividad"}
      pageTitle={duplicateId ? "Duplicar Actividad" : "Nueva Actividad"}
      pageSubtitle={
        duplicateId
          ? "Modifica los detalles de la copia antes de guardarla."
          : "Configura los detalles y el código inicial para el alumno."
      }
      saveLabel="Guardar Actividad"
      onCancel={() => navigate(`/subject/${subjectId}`)}
      onSave={handleSave}
      isSaving={isSaving}
      formData={formData}
      onFieldChange={handleFieldChange}
      editorLanguages={editorLanguages}
      isLoadingEditor={isLoadingLanguages}
      testCases={testCases}
      onTestCasesChange={setTestCases}
      isTestCaseModalOpen={isTestCaseModalOpen}
      onOpenTestCaseModal={() => setIsTestCaseModalOpen(true)}
      onCloseTestCaseModal={() => setIsTestCaseModalOpen(false)}
      activityKey={duplicateId || "new"}
    />
  );
}
