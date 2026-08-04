import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ActivityConfigCardsProps {
  title: string;
  description: string;
  allowCopy: boolean;
  allowPaste: boolean;
  maxAttempts: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAllowCopyChange: (value: boolean) => void;
  onAllowPasteChange: (value: boolean) => void;
  onMaxAttemptsChange: (value: string) => void;
}

export function ActivityConfigCards({
  title,
  description,
  allowCopy,
  allowPaste,
  maxAttempts,
  onTitleChange,
  onDescriptionChange,
  onAllowCopyChange,
  onAllowPasteChange,
  onMaxAttemptsChange,
}: ActivityConfigCardsProps) {
  return (
    <>
      <Card className="dark:bg-zinc-900/50 dark:border-zinc-800 shadow-sm shrink-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ej. Suma de Matrices"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Instrucciones</Label>
            <Textarea
              id="description"
              placeholder="Escribe el planteamiento del problema..."
              className="min-h-[140px] resize-y"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-zinc-900/50 dark:border-zinc-800 shadow-sm shrink-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Restricciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium cursor-pointer" htmlFor="allow-copy">
              Permitir Copiar
            </Label>
            <Switch
              id="allow-copy"
              checked={allowCopy}
              onCheckedChange={onAllowCopyChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium cursor-pointer" htmlFor="allow-paste">
              Permitir Pegar
            </Label>
            <Switch
              id="allow-paste"
              checked={allowPaste}
              onCheckedChange={onAllowPasteChange}
            />
          </div>
          <div className="space-y-2 pt-4 border-t border-border">
            <Label htmlFor="maxAttempts">Intentos de Compilación Máximos</Label>
            <div className="flex items-center gap-3">
              <Input
                id="maxAttempts"
                type="number"
                min="0"
                className="w-24"
                value={maxAttempts}
                onChange={(e) => onMaxAttemptsChange(e.target.value)}
              />
              <span className="text-xs text-muted-foreground">0 = Ilimitados</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default ActivityConfigCards;
