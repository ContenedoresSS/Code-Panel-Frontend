import { useState, useEffect } from "react";
import type { ReactNode } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  User,
  Lock,
  Mail,
  Shield,
  Hash,
  Eye,
  EyeOff,
  Plus,
  X,
  Globe,
  Settings as SettingsIcon,
} from "lucide-react";
import { getProfile, updateProfile, changePassword } from "@/service/UserService";
import { getEmailDomains, updateEmailDomains } from "@/service/SettingsService";
import { useAuth } from "@/assets/context/useAuth";
import { UserRole } from "@/types/enum/UserRole";
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

const DOMAIN_PATTERN = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;

interface SectionHeadingProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

function SectionHeading({ icon, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-muted-foreground text-sm mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function Settings() {
  const { user, updateUserName } = useAuth();
  const isGod = user?.role === UserRole.GOD;

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [emailDomains, setEmailDomains] = useState<string[]>([]);
  const [domainInput, setDomainInput] = useState("");
  const [domainError, setDomainError] = useState("");
  const [isLoadingDomains, setIsLoadingDomains] = useState(true);
  const [isSavingDomains, setIsSavingDomains] = useState(false);

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

  useEffect(() => {
    if (!isGod) return;
    const fetchDomains = async () => {
      try {
        const data = await getEmailDomains();
        setEmailDomains(data.domains.map((domain) => domain.trim().toLowerCase()));
      } catch (error) {
        logger.error("Error al cargar dominios:", error);
        toast.error("No se pudieron cargar los dominios permitidos");
      } finally {
        setIsLoadingDomains(false);
      }
    };
    fetchDomains();
  }, [isGod]);

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

  const addDomain = () => {
    const value = domainInput.trim().toLowerCase();
    if (!value) return;
    if (!DOMAIN_PATTERN.test(value)) {
      setDomainError("Ingresa un dominio válido (ej. uady.mx)");
      return;
    }
    if (emailDomains.includes(value)) {
      setDomainError("Ese dominio ya está en la lista");
      return;
    }
    setEmailDomains((prev) => [...prev, value]);
    setDomainInput("");
    setDomainError("");
  };

  const removeDomain = (domain: string) => {
    setEmailDomains((prev) => prev.filter((d) => d !== domain));
  };

  const onDomainsSubmit = async () => {
    try {
      setIsSavingDomains(true);
      const data = await updateEmailDomains({ domains: emailDomains });
      setEmailDomains(data.domains.map((domain) => domain.trim().toLowerCase()));
      toast.success("Dominios permitidos actualizados correctamente");
    } catch (error) {
      logger.error("Error al guardar dominios:", error);
      toast.error("No se pudieron actualizar los dominios permitidos");
    } finally {
      setIsSavingDomains(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gestiona tu perfil y las configuraciones globales del sistema.
        </p>
      </div>

      <section className="space-y-6">
        <SectionHeading
          icon={<User className="w-5 h-5" />}
          title="Configuración del Perfil"
          subtitle="Tu información personal y la seguridad de tu cuenta."
        />

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
                          <Input {...field} id="name" placeholder="Tu nombre" />
                          {fieldState.error && (
                            <p className="text-xs text-destructive mt-1">
                              {fieldState.error.message}
                            </p>
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
                          <Input {...field} id="lastName" placeholder="Tu apellido" />
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
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {fieldState.error && (
                          <p className="text-xs text-destructive mt-1">
                            {fieldState.error.message}
                          </p>
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
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {fieldState.error && (
                          <p className="text-xs text-destructive mt-1">
                            {fieldState.error.message}
                          </p>
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
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {fieldState.error && (
                          <p className="text-xs text-destructive mt-1">
                            {fieldState.error.message}
                          </p>
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
      </section>

      {isGod && (
        <>
          <Separator />
          <section className="space-y-6">
            <SectionHeading
              icon={<SettingsIcon className="w-5 h-5" />}
              title="Configuración Global del Sistema"
              subtitle="Opciones que afectan a toda la plataforma. Solo administradores."
            />

            <Card className="dark:bg-zinc-900/50 dark:border-zinc-800 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="w-5 h-5 text-primary" />
                  Dominios de correo permitidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingDomains ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FieldSet>
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="domainInput">Agregar dominio</FieldLabel>
                          <div className="flex gap-2">
                            <Input
                              id="domainInput"
                              value={domainInput}
                              onChange={(e) => {
                                setDomainInput(e.target.value);
                                setDomainError("");
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addDomain();
                                }
                              }}
                              placeholder="ej. uady.mx"
                            />
                            <Button type="button" variant="outline" onClick={addDomain}>
                              <Plus className="w-4 h-4 mr-1" />
                              Añadir
                            </Button>
                          </div>
                          {domainError && (
                            <p className="text-xs text-destructive mt-1">{domainError}</p>
                          )}
                        </Field>
                      </FieldGroup>
                    </FieldSet>

                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Lista actual</p>
                      <div className="flex flex-wrap gap-2">
                        {emailDomains.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Todos los dominios están permitidos.
                          </p>
                        ) : (
                          emailDomains.map((domain) => (
                            <Badge
                              key={domain}
                              variant="secondary"
                              className="gap-1 py-1 px-2 text-sm"
                            >
                              {domain}
                              <button
                                type="button"
                                onClick={() => removeDomain(domain)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                                aria-label={`Eliminar ${domain}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Solo las cuentas con estos dominios podrán registrarse. Deja la lista vacía
                      para permitir todos los dominios.
                    </p>

                    <Button
                      type="button"
                      className="w-full sm:w-auto"
                      disabled={isSavingDomains}
                      onClick={onDomainsSubmit}
                    >
                      {isSavingDomains ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        "Guardar Dominios"
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
