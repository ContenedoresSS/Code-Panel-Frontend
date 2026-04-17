
import * as React from "react"
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Field, FieldGroup, FieldLabel, FieldSet} from "./ui/field"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { registerUser } from "@/Service/AuthService";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
const formSchema = z.object({
        name: z
        .string()
        .min(2,"El nombre debe tener amenos 2 caracteres"),
        lastName: z
        .string()
        .min(2,"El nombre debe tener amenos 2 caracteres"),
        email: z.email("Por favor, ingresa un correo válido."),
        password: z
        .string()
        .min(8,"La contraseña debe tener almenos 8 caracteres"),
        confirmPassword:z
        .string(),
        clave: z
        .string()
        .min(1, "la clave es obligatoria"),
        code: z
        .string()
        .min(1, "El codigo es obligatorio"),
    }).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"], 
})
export function RegisterForm (){
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues :{
            name: "",
            lastName:"",
            email:"",
            password: "",
            confirmPassword:"",
            clave:"",
            code: "",
        },
    })
    async function onSubmit (values: z.infer<typeof formSchema>){
        setIsLoading(true);

        try{
            const data = await registerUser(values);

            toast.success("¡Registro exitoso!", {
            description: 'Bienvenido a Code Panel.',
        });
        console.log("respuesta del servidor", data);
        const navigate = useNavigate();

        }catch (error: any) {

        const errorMessage = error.response?.data?.message || "Hubo un error en el servidor";
            
            toast.error("Error al registrar", {
            description: errorMessage,
            });
        } finally {
            setIsLoading(false); 
        }
}
return(
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
        <FieldSet>
            
            <FieldGroup>
                <Controller
                name="name"
                control={form.control}
                render={({field})=>(
                    <Field >
                        <FieldLabel htmlFor="name">Nombres</FieldLabel>
                        <Input  id="name" autoComplete="off" placeholder="Tus nombres" required/>
                    </Field>
                )}>
                </Controller>
                <Controller
                name="lastName"
                control={form.control}
                render={({field})=>(
                    <Field >
                        <FieldLabel htmlFor="lastName">Apellidos</FieldLabel>
                        <Input  id="lastName" autoComplete="off" placeholder="Tus Apellidos" required/>
                    </Field>
                )}>
                </Controller>
                <Controller
                name="email"
                control={form.control}
                render={({field})=>(   
                    <Field>
                        <FieldLabel htmlFor="email">Correo Electronico</FieldLabel>
                        <Input id="email" type="email" autoComplete="off" placeholder="eduardo20contreras@gmail.com"  required/>
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
                            <Input id="password" autoComplete="off" type="password" placeholder="*******"  required/>
                        </Field>
                        )}>
                    </Controller>
                    <Controller
                    name="confirmPassword"
                    control={form.control}
                    render={({field})=>(
                        <Field>
                            <FieldLabel htmlFor="confirmPassword">Confirmar Contraseña</FieldLabel>
                            <Input id="confirmPassword" autoComplete="off" type="password" placeholder="*******"  required/>
                        </Field>
                        )}>
                    </Controller>
                </FieldGroup>  
                <FieldGroup className="grid max-w-sm grid-cols-2">
                    <Controller
                    name="clave"
                    control={form.control}
                    render={({field})=>(
                        <Field>
                            <FieldLabel htmlFor="clave">Clave del trabajador</FieldLabel>
                            <Input id="clave" autoComplete="off"  placeholder="12346" required/>
                        </Field>
                    )}>
                    </Controller>
                    <Controller
                    name="code"
                    control={form.control}
                    render={({field})=>(
                        <Field>
                            <FieldLabel htmlFor="code">Código de Acceso</FieldLabel>
                            <Input id="code" autoComplete="off" placeholder="AW34G" required/>
                        </Field>
                        )}>
                    </Controller>
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