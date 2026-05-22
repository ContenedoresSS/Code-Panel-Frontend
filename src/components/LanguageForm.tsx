import { useState } from "react"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { createLanguage } from "@/service/LanguageService"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { Loader2,} from "lucide-react"
import { Field, FieldGroup, FieldLabel, FieldSet } from "./ui/field"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

const formSchema = z.object({
  name: z.string().min(1,"El nombre es obligatorio (ej. Java)"),
  version: z.string().min(1,"La version es obligatoria (ej. 7.1)"),
  dockerImage: z.string().min(1,"La imagen de Docker es obligatoria (ej. java:3.9-alpine)"),
  executionCommand: z.string().min(1,"El comando es obligatorio (ej. npm run dev)"),
  fileExtension: z.string().min(1,"La extensión es obligatoria (ej. .jar )")
})
export default function LanguageForm (){
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      version: "",
      dockerImage: "",
      executionCommand: "",
      fileExtension: "",
    },
  })

  async function onSubmit(values:z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await createLanguage(values);
      toast.success(`Lenguaje ${values.name} registrado con éxito`);
      form.reset();
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      
      if (errorMessage.includes("already exists")) {
        toast.error(`La versión ${values.version} de ${values.name} ya está registrada.`);
      } else {
        toast.error("Ocurrió un error al registrar el lenguaje.");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return(
<Card className="w-full shadow-sm border-gray-200">
  <CardHeader>
    <CardTitle className="text-xl font-bold text-slate-900">
      Configurar Lenguaje
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

          {/* Fila 2: Imagen de Docker (Ancho completo) */}
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

          {/* Fila 3: Comando de Ejecución y Extensión */}
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Controller
              name="executionCommand"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="executionCommand">Comando</FieldLabel>
                  <Input {...field} id="executionCommand" autoComplete="off" placeholder="ej. python main.py" required />
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
                  <Input {...field} id="fileExtension" autoComplete="off" placeholder="ej. .py" required />
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

      {/* Botón de Enviar */}
      <div className="flex justify-center mt-6">
        <Button 
          type="submit"
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-border rounded-md transition-colors ${
            isLoading 
              ? 'bg-muted opacity-50 cursor-not-allowed' 
              : 'hover:bg-muted'
          }`}
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {isLoading ? 'Registrando...' : 'Registrar Lenguaje'}
        </Button>
      </div>
    </form>
  </CardContent>
</Card>
  )
} 