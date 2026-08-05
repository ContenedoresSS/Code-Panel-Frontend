import { useEffect, useState } from "react"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { createLanguage, updateLanguage } from "@/service/LanguageService"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { Loader2 } from "lucide-react"
import { Field, FieldGroup, FieldLabel, FieldSet } from "./ui/field"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { logger } from "@/lib/logger"
import type { LanguageResponse } from "@/types/response/LanguageResponse"

const formSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio (ej. Java)"),
  version: z.string().min(1, "La versión es obligatoria (ej. 7.1)"),
  dockerImage: z.string().min(1, "La imagen de Docker es obligatoria (ej. java:3.9-alpine)"),
  executionCommand: z.string().min(1, "El comando es obligatorio (ej. npm run dev)"),
  fileExtension: z.string().min(1, "La extensión es obligatoria (ej. .jar)"),
  monacoName: z.string().min(1, "El identificador para Monaco es obligatorio (ej. javascript)"),
})

interface LanguageFormProps {
  language?: LanguageResponse | null
  onSuccess?: () => void
  onCancel?: () => void
}

export default function LanguageForm({ language, onSuccess, onCancel }: LanguageFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!language;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      version: "",
      dockerImage: "",
      executionCommand: "",
      fileExtension: "",
      monacoName: "",
    },
  })

  useEffect(() => {
    if (language) {
      form.reset({
        name: language.name,
        version: language.version,
        dockerImage: language.dockerImage,
        executionCommand: language.executionCommand,
        fileExtension: language.fileExtension,
        monacoName: language.editorIdentifier,
      })
    }
  }, [language, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const payload = {
        name: values.name,
        version: values.version,
        dockerImage: values.dockerImage,
        executionCommand: values.executionCommand,
        fileExtension: values.fileExtension,
        editorIdentifier: values.monacoName,
      };

      if (isEditing && language) {
        await updateLanguage(language.id, payload);
        toast.success(`Lenguaje ${values.name} actualizado con éxito`);
        onSuccess?.();
      } else {
        await createLanguage(payload);
        toast.success(`Lenguaje ${values.name} registrado con éxito`);
        form.reset();
        onSuccess?.();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;

      if (errorMessage.includes("already exists")) {
        toast.error(`La versión ${values.version} de ${values.name} ya está registrada.`);
      } else {
        toast.error("Ocurrió un error al guardar el lenguaje.");
      }
      logger.error("Language form error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">
          {isEditing ? "Editar Lenguaje" : "Configurar Lenguaje"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldSet>
            <FieldGroup>

              {/* Fila 1: Nombre y Versión */}
              <FieldGroup className="grid grid-cols-2 gap-4">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="name">Nombre</FieldLabel>
                      <Input {...field} id="name" autoComplete="off" placeholder="ej. Python" required />
                      {form.formState.errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="version"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="version">Versión</FieldLabel>
                      <Input {...field} id="version" autoComplete="off" placeholder="ej. 3.9" required />
                      {form.formState.errors.version && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.version.message}
                        </p>
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              {/* Fila 2: Imagen Docker y Monaco Identifier */}
              <FieldGroup className="grid grid-cols-2 gap-4">
                <Controller
                  name="dockerImage"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="dockerImage">Imagen Docker</FieldLabel>
                      <Input {...field} id="dockerImage" autoComplete="off" placeholder="ej. python:3.9-alpine" required />
                      {form.formState.errors.dockerImage && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.dockerImage.message}
                        </p>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="monacoName"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="monacoName">Identifier Monaco</FieldLabel>
                      <Input {...field} id="monacoName" autoComplete="off" placeholder="ej. python (identificador del editor)" required />
                      {form.formState.errors.monacoName && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.monacoName.message}
                        </p>
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              {/* Fila 3: Comando de Ejecución y Extensión */}
              <FieldGroup className="grid grid-cols-2 gap-4">
                <Controller
                  name="executionCommand"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="executionCommand">Comando</FieldLabel>
                      <Input {...field} id="executionCommand" autoComplete="off" placeholder="ej. python3 \u0024{file}" required />
                      {form.formState.errors.executionCommand && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.executionCommand.message}
                        </p>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="fileExtension"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="fileExtension">Extensión</FieldLabel>
                      <Input {...field} id="fileExtension" autoComplete="off" placeholder="ej. py" required />
                      {form.formState.errors.fileExtension && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.fileExtension.message}
                        </p>
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

            </FieldGroup>
          </FieldSet>

          <div className="flex justify-center gap-3 mt-6">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-border rounded-md transition-colors ${isLoading
                ? 'bg-muted opacity-50 cursor-not-allowed'
                : 'hover:bg-muted'
                }`}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isLoading
                ? (isEditing ? 'Actualizando...' : 'Registrando...')
                : (isEditing ? 'Actualizar Lenguaje' : 'Registrar Lenguaje')
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
