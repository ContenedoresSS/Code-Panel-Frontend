import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

export default function RecoverPassword() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full dark:bg-zinc-900/50 dark:border-zinc-800 shadow-sm text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Construction className="w-6 h-6 text-yellow-500" />
            En Desarrollo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Estamos trabajando en el apartado de recuperación de contraseña. Pronto estará disponible.
          </p>
          <Button variant="outline" onClick={() => navigate("/login")} className="w-full">
            Volver al inicio de sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
