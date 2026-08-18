import { useEffect, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { updateUserAdmin } from "@/service/UserService";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { logger } from "@/lib/logger";
import type { UserListItem } from "@/types/response/UserListItem";
import type { UpdateUserRequest } from "@/types/request/UpdateUserRequest";
import { UserRole } from "@/types/enum/UserRole";

const formSchema = z.object({
  role: z.enum([UserRole.GOD, UserRole.TEACHER, UserRole.STUDENT]),
  isActive: z.boolean(),
  password: z
    .string()
    .refine((value) => value === "" || value.length >= 8, {
      message: "La contraseña debe tener al menos 8 caracteres",
    }),
});

interface EditUserModalProps {
  user: UserListItem | null;
  onClose: () => void;
  onSuccess: (updatedUser: UserListItem) => void;
}

export function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: UserRole.STUDENT,
      isActive: true,
      password: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        role: (user.role.name as UserRole) ?? UserRole.STUDENT,
        isActive: user.isActive,
        password: "",
      });
    }
  }, [user, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    setIsLoading(true);
    try {
      const payload: UpdateUserRequest = {};

      if (values.role !== user.role.name) {
        payload.role = values.role;
      }
      if (values.isActive !== user.isActive) {
        payload.isActive = values.isActive;
      }
      if (values.password) {
        payload.password = values.password;
      }

      if (Object.keys(payload).length === 0) {
        toast.info("No hay cambios para guardar");
        return;
      }

      const updatedUser = await updateUserAdmin(user.id, payload);
      toast.success("Usuario actualizado correctamente");
      onSuccess(updatedUser);
    } catch (error: any) {
      logger.error("Update user error:", error);
      const message = error.response?.data?.error;
      if (message?.includes("último administrador")) {
        toast.error(message);
      } else if (message) {
        toast.error(message);
      } else {
        toast.error("Ocurrió un error al actualizar el usuario.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={!!user} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            {user?.name} {user?.lastName} · {user?.email}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Controller
              name="role"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.STUDENT}>Student</SelectItem>
                    <SelectItem value={UserRole.TEACHER}>Teacher</SelectItem>
                    <SelectItem value={UserRole.GOD}>God</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Cuenta activa</Label>
              <p className="text-xs text-muted-foreground">
                {form.watch("isActive")
                  ? "El usuario puede iniciar sesión."
                  : "El usuario no podrá iniciar sesión."}
              </p>
            </div>
            <Controller
              name="isActive"
              control={form.control}
              render={({ field }) => (
                <Switch
                  id="isActive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Dejar vacío para no cambiar"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditUserModal;
