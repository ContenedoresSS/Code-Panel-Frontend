
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Field, FieldGroup, FieldLabel, FieldSet} from "./ui/field"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { registerUser } from "@/service/AuthService";
import { useNavigate } from "react-router";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { logger } from "@/lib/logger";
const formSchema = z.object({
      name: z
      .string()
      .min(2,"El nombre debe tener al menos 2 caracteres")
      .transform((v) => v.trim().toUpperCase()),
      lastName: z
      .string()
      .min(2,"El apellido debe tener al menos 2 caracteres")
      .transform((v) => v.trim().toUpperCase()),
      email: z.email("Por favor, ingresa un correo válido."),
      password: z
      .string()
      .min(8,"La contraseña debe tener almenos 8 caracteres"),
      confirmPassword:z
      .string(),
      identifier: z
      .string()
      .min(1,"Este campo es obligatorio"),
      invitationCode: z
      .string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"], 
})
export function RegisterForm (){
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"student" | "teacher">("student");
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues :{
          name: "",
          lastName:"",
          email:"",
          password: "",
          confirmPassword:"",
          identifier:"",
          invitationCode: "",
      },
  })
  const esProfesor = role === "teacher";
  const handleRoleChange = (newRole: "student" | "teacher") => {
      setRole(newRole);
      if (newRole === "student") {
          form.setValue("invitationCode", "");
      }
  };
  async function onSubmit (values: z.infer<typeof formSchema>){
      setIsLoading(true);

      if (esProfesor && !values.invitationCode?.trim()) {
          toast.error("El código de acceso es obligatorio para profesores");
          setIsLoading(false);
          return;
      }

      try{
        const payload = {
          name: values.name,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          identifier: values.identifier,
          invitationCode: esProfesor ? values.invitationCode : undefined,
        };
        await registerUser(payload);

          toast.success("¡Registro exitoso!");
      
      navigate("/login")

      }catch (error: any) {

      const errorMessage = error.response?.data?.message || "Hubo un error en el servidor";
      logger.error("Register error:", error);
          
          toast.error("Error al registrar", {
          description: errorMessage,
          });
      } finally {
          setIsLoading(false); 
      }
}
return(
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
      <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={role === "student" ? "default" : "outline"}
            onClick={() => handleRoleChange("student")}
          >
            Estudiante
          </Button>
          <Button
            type="button"
            variant={role === "teacher" ? "default" : "outline"}
            onClick={() => handleRoleChange("teacher")}
          >
            Profesor
          </Button>
      </div>
      <FieldSet>
          
          <FieldGroup>
              <Controller
              name="name"
              control={form.control}
              render={({field})=>(
                  <Field >
                      <FieldLabel htmlFor="name">Nombres</FieldLabel>
                      <Input {...field}  id="name" autoComplete="off" placeholder="Tus nombres" required/>
                  </Field>
              )}>
              </Controller>
              <Controller
              name="lastName"
              control={form.control}
              render={({field})=>(
                  <Field >
                      <FieldLabel htmlFor="lastName">Apellidos</FieldLabel>
                      <Input {...field}  id="lastName" autoComplete="off" placeholder="Tus Apellidos" required/>
                  </Field>
              )}>
              </Controller>
              <Controller
              name="email"
              control={form.control}
              render={({field})=>(   
                  <Field>
                      <FieldLabel htmlFor="email">Correo Electronico</FieldLabel>
                      <Input {...field}  id="email" type="email" autoComplete="off" placeholder="eduardo20contreras@gmail.com"  required/>
                      {form.formState.errors.email && (
                              <p className="text-red-500 text-xs mt-1">
                              {form.formState.errors.email.message}
                              </p>
                          )}
                  </Field>
              )}>
              </Controller>
              <FieldGroup className="grid max-w-sm grid-cols-2">
                  <Controller
                  name="password"
                  control={form.control}
                  render={({field})=>(   
                      <Field>
                          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                          <div className="relative">
                            <Input {...field}  id="password" autoComplete="off" type={showPassword ? "text" : "password"} placeholder="*******"  required/>
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {form.formState.errors.password && (
                              <p className="text-red-500 text-xs mt-1">
                              {form.formState.errors.password.message}
                              </p>
                          )}
                      </Field>
                      )}>
                  </Controller>
                  <Controller
                  name="confirmPassword"
                  control={form.control}
                  render={({field})=>(
                      <Field>
                          <FieldLabel htmlFor="confirmPassword">Confirmar Contraseña</FieldLabel>
                          <div className="relative">
                            <Input {...field}  id="confirmPassword" autoComplete="off" type={showPassword ? "text" : "password"} placeholder="*******"  required/>
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {form.formState.errors.confirmPassword && (
                              <p className="text-red-500 text-xs mt-1">
                              {form.formState.errors.confirmPassword.message}
                              </p>
                          )}
                      </Field>
                      )}>
                  </Controller>
              </FieldGroup>  
              <FieldGroup className={`grid max-w-sm ${esProfesor ? "grid-cols-2" : "grid-cols-1"}`}>
                  <Controller
                  name="identifier"
                  control={form.control}
                  render={({field})=>(
                      <Field>
                          <FieldLabel htmlFor="identifier">{esProfesor ? "Clave del trabajador" : "Matrícula"}</FieldLabel>
                          <Input {...field}  id="identifier" autoComplete="off"  placeholder={esProfesor ? "12346" : "1234567"} required/>
                          {form.formState.errors.identifier && (
                              <p className="text-red-500 text-xs mt-1">
                              {form.formState.errors.identifier.message}
                              </p>
                          )}
                      </Field>
                  )}>
                  </Controller>
                  {esProfesor && (
                    <Controller
                    name="invitationCode"
                    control={form.control}
                    render={({field})=>(
                        <Field>
                            <FieldLabel htmlFor="invitationCode">Código de Acceso</FieldLabel>
                            <Input {...field} id="invitationCode" autoComplete="off" placeholder="AW34G" required/>
                        </Field>
                        )}>
                    </Controller>
                  )}
              </FieldGroup>
          </FieldGroup>
  </FieldSet>
  <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
          <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
          </>
          ) : (
          "Crear cuenta"
          )}
  </Button>
  </form>
)
}
export default RegisterForm;