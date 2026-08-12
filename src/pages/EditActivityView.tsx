import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { getActivitiesById, updateActivity } from "@/service/ActivityService";
import { getAllLanguages } from "@/service/LanguageService";
import { getTestCases, createTestCase, updateTestCase, deleteTestCase } from "@/service/TestCaseService";
import { getSubjectById } from "@/service/SubjectService";
import type { UpdateActivityRequest } from "@/types/request/UpdateActivityRequest";
import type { SubjectResponse } from "@/types/response/SubjectResponse";
import type { EditorLanguage } from "@/types/EditorProps";
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

export default function EditActivityView() {
  const { id: subjectId, activityId } = useParams<{ id: string; activityId: string }>();
  const navigate = useNavigate();

  const [editorLanguages, setEditorLanguages] = useState<EditorLanguage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [subject, setSubject] = useState<SubjectResponse | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isTestCaseModalOpen, setIsTestCaseModalOpen] = useState(false);
  const [formData, setFormData] = useState<ActivityFormData>(DEFAULT_FORM_DATA);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!activityId) return;
      const numericSubjectId = Number(subjectId);

      try {
        setIsLoading(true);
        const [langsData, activityData, subjectData, testCasesData] = await Promise.all([
          getAllLanguages(),
          getActivitiesById(activityId),
          getSubjectById(numericSubjectId),
          getTestCases(activityId).catch(() => []),
        ]);

        setEditorLanguages(mapApiLanguagesToEditorLanguages(langsData));
        setSubject(subjectData);
        setTestCases(testCasesData);
        setFormData(populateFormFromActivity(activityData));
      } catch (error) {
        logger.error("Error al cargar la actividad:", error);
        navigate(`/subject/${subjectId}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [activityId, subjectId, navigate]);

  const handleUpdate = async () => {
    if (!formData.title || !activityId) return;

    try {
      setIsSaving(true);
      const payload: UpdateActivityRequest = buildActivityPayload(formData);
      await updateActivity(activityId, payload);

      const originalTestCases = await getTestCases(activityId);

      const newTestCases = testCases.filter((tc) => tc.id < 0);
      for (const tc of newTestCases) {
        await createTestCase(activityId, {
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
        });
      }

      const modifiedTestCases = testCases.filter((tc) => {
        if (tc.id < 0) return false;
        const original = originalTestCases.find((otc) => otc.id === tc.id);
        if (!original) return false;
        return (
          original.input !== tc.input ||
          original.expectedOutput !== tc.expectedOutput ||
          original.isHidden !== tc.isHidden
        );
      });
      for (const tc of modifiedTestCases) {
        await updateTestCase(activityId, tc.id, {
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
        });
      }

      const deletedTestCases = originalTestCases.filter(
        (otc) => !testCases.find((tc) => tc.id === otc.id)
      );
      for (const tc of deletedTestCases) {
        await deleteTestCase(activityId, tc.id);
      }

      const refreshedTestCases = await getTestCases(activityId);
      setTestCases(refreshedTestCases);

      navigate(`/subject/${subjectId}`);
    } catch (error) {
      logger.error("Error al actualizar la actividad:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: keyof ActivityFormData, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ActivityFormLayout
      subjectId={subjectId!}
      subjectName={subject?.name ?? ""}
      breadcrumbLast={formData.title}
      pageTitle="Editar Actividad"
      pageSubtitle="Actualiza los detalles y restricciones."
      saveLabel="Actualizar Cambios"
      onCancel={() => navigate(`/subject/${subjectId}`)}
      onSave={handleUpdate}
      isSaving={isSaving}
      formData={formData}
      onFieldChange={handleFieldChange}
      editorLanguages={editorLanguages}
      isLoadingEditor={false}
      testCases={testCases}
      onTestCasesChange={setTestCases}
      isTestCaseModalOpen={isTestCaseModalOpen}
      onOpenTestCaseModal={() => setIsTestCaseModalOpen(true)}
      onCloseTestCaseModal={() => setIsTestCaseModalOpen(false)}
      isFullPageLoading={isLoading}
    />
  );
}
