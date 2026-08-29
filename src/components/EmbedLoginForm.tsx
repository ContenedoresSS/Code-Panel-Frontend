import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Field, FieldGroup, FieldLabel, FieldSet } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { loginUser } from "@/service/AuthService";
import { useAuth } from "@/assets/context/useAuth";
import { logger } from "@/lib/logger";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  identifier: z.string().min(1, "Ingresa tu correo o identificador"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

interface EmbedLoginFormProps {
  onLoginSuccess?: () => void;
  onGuestMode?: () => void;
}

export function EmbedLoginForm({ onLoginSuccess, onGuestMode }: EmbedLoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { loginState } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const data = await loginUser(values);
      loginState(data.token, data.refreshToken);
      toast.success("Sesión iniciada correctamente");
      onLoginSuccess?.();
    } catch (error: unknown) {
      logger.error("Login error:", error);
      toast.error("Credenciales inválidas", {
        description: "Por favor verifica tus datos e intenta de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight">CodePanel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inicia sesión para acceder a la actividad
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="identifier">Identificador</FieldLabel>
                <Input
                  {...form.register("identifier")}
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  placeholder="usuario@correo.com"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                <Input
                  {...form.register("password")}
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </Field>
            </FieldGroup>
          </FieldSet>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>

        {onGuestMode && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                o
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onGuestMode}
            >
              Continuar sin iniciar sesión
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Podrás ver y ejecutar la actividad, pero tu envío no se guardará en la plataforma.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmbedLoginForm;
