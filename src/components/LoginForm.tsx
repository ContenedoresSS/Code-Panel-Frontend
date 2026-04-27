
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Field, FieldGroup, FieldLabel, FieldSeparator, FieldSet} from "./ui/field"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { loginUser} from "@/service/AuthService";
import { NavLink, useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { TokenService } from "@/service/TokenService";
const formSchema = z.object({
        identifier: z.email("Por favor, ingresa un correo válido."),
        password: z
        .string()
        .min(8,"La contraseña debe tener almenos 8 caracteres"),
    })
export function LoginForm (){
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues :{
            identifier:"",
            password: "",
        },
    })

    async function onSubmit (values: z.infer<typeof formSchema>){
        setIsLoading(true);

        try{
            const data = await loginUser(values);
            
            TokenService.setTokens(data.token, data.refreshToken);
            toast.success("¡Login exitoso!", {
            description: 'Bienvenido a Code Panel.',
        });
        console.log("respuesta del servidor", data);
        navigate("/dashboard")

        }catch (error: any) {
            const status = error.response?.status;
            console.log(error);
            toast.error(" Credenciales invalidas o Session Expirada", {
            description:"Error: "+ status + " Por favor verifica tus credenciales",
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
                name="identifier"
                control={form.control}
                render={({field})=>(   
                    <Field>
                        <FieldLabel htmlFor="identifier">Correo Electronico</FieldLabel>
                        <Input {...field} id="identifier" type="email" autoComplete="off" placeholder="eduardo20contreras@gmail.com"  required/>
                    </Field>
                )}>
                </Controller>      
                <Controller
                name="password"
                control={form.control}
                render={({field})=>(   
                    <Field>
                        <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                        <Input {...field} id="password" autoComplete="off" type="password" placeholder="*******"  required/>
                    </Field>
                    )}>
                </Controller>

            </FieldGroup>
            
    </FieldSet>
            <div className="mt-10 text-center text-sm text-gray-600">
                
                <NavLink 
                    to="/recover-password" 
                    className="font-bold text-[#0D1621] hover:underline transition-all"
                >
                    Olvidé mi contraseña
                </NavLink>
            </div>
    <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
            </>
            ) : (
            "Iniciar Sesión"
            )}
    </Button>
    
    </form>
)
}
export default LoginForm;