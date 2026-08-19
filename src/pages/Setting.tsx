import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, User, Lock, Mail, Shield, Hash, Eye, EyeOff } from "lucide-react";
import { getProfile, updateProfile, changePassword } from "@/service/UserService";
import { useAuth } from "@/assets/context/useAuth";
import type { UserProfileResponse } from "@/types/response/UserProfileResponse";
import { logger } from "@/lib/logger";

const profileSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export default function Settings() {
  const { updateUserName } = useAuth();

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", lastName: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        profileForm.reset({ name: data.name, lastName: data.lastName || "" });
      } catch (error) {
        logger.error("Error al cargar perfil:", error);
        toast.error("No se pudo cargar la información del perfil");
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [profileForm]);

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      setIsSavingProfile(true);
      await updateProfile({ name: values.name, lastName: values.lastName || undefined });
      updateUserName(values.name);
      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      logger.error("Error al actualizar perfil:", error);
      toast.error("No se pudo actualizar el perfil");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    try {
      setIsChangingPassword(true);
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Contraseña actualizada correctamente");
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { error?: string } } };
      if (err?.response?.status === 401) {
        toast.error("La contraseña actual es incorrecta");
        return;
      }
      logger.error("Error al cambiar contraseña:", error);
      toast.error("No se pudo cambiar la contraseña");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gestiona tu información personal y seguridad de la cuenta.
        </p>
      </div>

      <Card className="dark:bg-zinc-900/50 dark:border-zinc-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-primary" />
            Información de Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingProfile ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FieldSet>
                <FieldGroup>
                  <Controller
                    name="name"
                    control={profileForm.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor="name">Nombre</FieldLabel>
                        <Input
                          {...field}
                          id="name"
                          placeholder="Tu nombre"
                        />
                        {fieldState.error && (
                          <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="lastName"
                    control={profileForm.control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor="lastName">Apellido</FieldLabel>
                        <Input
                          {...field}
                          id="lastName"
                          placeholder="Tu apellido"
                        />
                      </Field>
                    )}
                  />
                  <Field>
                    <FieldLabel htmlFor="email">
                      <Mail className="w-3.5 h-3.5 inline mr-1.5" />
                      Correo Electrónico
                    </FieldLabel>
                    <Input
                      id="email"
                      value={profile?.email || ""}
                      disabled
                      className="opacity-60 cursor-not-allowed"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="identifier">
                      <Hash className="w-3.5 h-3.5 inline mr-1.5" />
                      Identificador
                    </FieldLabel>
                    <Input
                      id="identifier"
                      value={profile?.identifier || "—"}
                      disabled
                      className="opacity-60 cursor-not-allowed"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>
                      <Shield className="w-3.5 h-3.5 inline mr-1.5" />
                      Rol
                    </FieldLabel>
                    <div className="pt-1">
                      <Badge variant="secondary" className="text-sm py-1 px-3">
                        {profile?.role?.name || "—"}
                      </Badge>
                    </div>
                  </Field>
                </FieldGroup>
              </FieldSet>
              <Button type="submit" className="w-full sm:w-auto" disabled={isSavingProfile}>
                {isSavingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="dark:bg-zinc-900/50 dark:border-zinc-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="w-5 h-5 text-primary" />
            Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <FieldSet>
              <FieldGroup>
                <Controller
                  name="currentPassword"
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="currentPassword">Contraseña actual</FieldLabel>
                      <div className="relative">
                        <Input
                          {...field}
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {fieldState.error && (
                        <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="newPassword"
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="newPassword">Nueva contraseña</FieldLabel>
                      <div className="relative">
                        <Input
                          {...field}
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 8 caracteres"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {fieldState.error && (
                        <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="confirmPassword"
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="confirmPassword">Confirmar contraseña</FieldLabel>
                      <div className="relative">
                        <Input
                          {...field}
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Repite la nueva contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {fieldState.error && (
                        <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldSet>
            <Button type="submit" className="w-full sm:w-auto" disabled={isChangingPassword}>
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cambiando...
                </>
              ) : (
                "Cambiar Contraseña"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
