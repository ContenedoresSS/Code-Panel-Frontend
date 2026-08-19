
import { useState } from "react";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { forgotPassword, resetPassword, verifyResetCode } from "@/service/AuthService";
import { logger } from "@/lib/logger";
import { ArrowLeft, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";

const emailSchema = z.object({
  email: z.email("Por favor, ingresa un correo válido."),
});

const codeSchema = z.object({
  code: z
    .string()
    .min(6, "El código debe tener 6 dígitos.")
    .max(6, "El código debe tener 6 dígitos.")
    .regex(/^\d{6}$/, "El código debe ser numérico de 6 dígitos."),
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type Step = 1 | 2 | 3;

export default function RecoverPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  async function onRequestCode(values: z.infer<typeof emailSchema>) {
    setIsLoading(true);
    try {
      await forgotPassword({ email: values.email });
      setEmail(values.email);
      setStep(2);
      toast.success("Código enviado", {
        description: "Si el correo está registrado, recibirás un código de recuperación.",
      });
    } catch (error: unknown) {
      logger.error("Forgot password error:", error);
      toast.error("No se pudo enviar el código", {
        description: "Inténtalo de nuevo más tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onVerifyCode(values: z.infer<typeof codeSchema>) {
    setIsLoading(true);
    try {
      const data = await verifyResetCode({ email, code: values.code });
      setResetToken(data.resetToken);
      setStep(3);
    } catch (error: unknown) {
      logger.error("Verify reset code error:", error);
      toast.error("Código inválido o expirado", {
        description: "Verifica el código e inténtalo nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onResetPassword(values: z.infer<typeof passwordSchema>) {
    if (!resetToken) return;
    setIsLoading(true);
    try {
      await resetPassword({ resetToken, newPassword: values.newPassword });
      toast.success("Contraseña actualizada", {
        description: "Ya puedes iniciar sesión con tu nueva contraseña.",
      });
      navigate("/login");
    } catch (error: unknown) {
      logger.error("Reset password error:", error);
      toast.error("No se pudo restablecer la contraseña", {
        description: "El enlace puede haber expirado. Solicita un nuevo código.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const stepMeta: Record<Step, { title: string; description: string; icon: React.ReactNode }> = {
    1: {
      title: "Recuperar contraseña",
      description: "Ingresa tu correo para recibir un código de verificación.",
      icon: <Mail className="w-6 h-6 text-primary" />,
    },
    2: {
      title: "Verifica tu código",
      description: "Ingresa el código de 6 dígitos que recibiste por correo.",
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
    },
    3: {
      title: "Nueva contraseña",
      description: "Establece una nueva contraseña para tu cuenta.",
      icon: <KeyRound className="w-6 h-6 text-primary" />,
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full dark:bg-zinc-900/50 dark:border-zinc-800 shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            {stepMeta[step].icon}
            {stepMeta[step].title}
          </CardTitle>
          <p className="text-muted-foreground text-sm">{stepMeta[step].description}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step
                    ? "w-8 bg-primary"
                    : s < step
                      ? "w-4 bg-primary/50"
                      : "w-4 bg-muted"
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <form onSubmit={emailForm.handleSubmit(onRequestCode)} className="space-y-4">
              <FieldSet>
                <FieldGroup>
                  <Controller
                    name="email"
                    control={emailForm.control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor="email">Correo Electrónico</FieldLabel>
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          autoComplete="off"
                          placeholder="usuario@correo.com"
                          required
                        />
                        {emailForm.formState.errors.email && (
                          <p className="text-red-500 text-xs mt-1">
                            {emailForm.formState.errors.email.message}
                          </p>
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </FieldSet>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar código"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Volver al inicio de sesión
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={codeForm.handleSubmit(onVerifyCode)} className="space-y-4">
              <FieldSet>
                <FieldGroup>
                  <Controller
                    name="code"
                    control={codeForm.control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor="code">Código de verificación</FieldLabel>
                        <Input
                          {...field}
                          id="code"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="123456"
                          className="text-center tracking-widest"
                          required
                        />
                        {codeForm.formState.errors.code && (
                          <p className="text-red-500 text-xs mt-1">
                            {codeForm.formState.errors.code.message}
                          </p>
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </FieldSet>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar código"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cambiar correo
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={passwordForm.handleSubmit(onResetPassword)} className="space-y-4">
              <FieldSet>
                <FieldGroup>
                  <Controller
                    name="newPassword"
                    control={passwordForm.control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor="newPassword">Nueva contraseña</FieldLabel>
                        <Input
                          {...field}
                          id="newPassword"
                          type="password"
                          autoComplete="new-password"
                          placeholder="Mínimo 8 caracteres"
                          required
                        />
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-red-500 text-xs mt-1">
                            {passwordForm.formState.errors.newPassword.message}
                          </p>
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="confirmPassword"
                    control={passwordForm.control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor="confirmPassword">Confirmar contraseña</FieldLabel>
                        <Input
                          {...field}
                          id="confirmPassword"
                          type="password"
                          autoComplete="new-password"
                          placeholder="Repite la nueva contraseña"
                          required
                        />
                        {passwordForm.formState.errors.confirmPassword && (
                          <p className="text-red-500 text-xs mt-1">
                            {passwordForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </FieldSet>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Restablecer contraseña"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
