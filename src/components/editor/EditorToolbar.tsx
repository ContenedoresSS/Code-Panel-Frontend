import { Download, Upload, ALargeSmall, Sun, Moon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { EditorLanguage } from "@/types/EditorProps";

interface EditorToolbarProps {
  fileName: string;
  darkMode: boolean;
  onToggleTheme: () => void;
  onChangeFontSize: (size: number) => void;
  languages: EditorLanguage[];
  currentLanguage: number;
  onLanguageChange: (value: string) => void;
}

export function EditorToolbar({
  fileName,
  darkMode,
  onToggleTheme,
  onChangeFontSize,
  languages,
  currentLanguage,
  onLanguageChange,
}: EditorToolbarProps) {
  return (
    <div className="flex justify-between items-center p-2 bg-muted/50 border-b border-border">
      <div className="flex border rounded-md bg-background min-h-[35px] md:min-h-[40px] transition-all">
        <span className="font-mono text-sm font-semibold px-2 text-foreground p-2">
          {fileName}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <button
          className="p-2 hover:bg-muted rounded-md transition-colors"
          title="Descargar código"
        >
          <Download className="w-5 h-5" />
        </button>
        <button
          className="p-2 hover:bg-muted rounded-md transition-colors"
          title="Subir código"
        >
          <Upload className="w-5 h-5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 hover:bg-muted rounded-md transition-colors"
              title="Cambiar tamaño de fuente"
            >
              <ALargeSmall className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => onChangeFontSize(12)}>
              12
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeFontSize(15)}>
              15
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeFontSize(18)}>
              18
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={onToggleTheme}
          className="p-2 hover:bg-muted rounded-md transition-colors"
          title="Cambiar tema del editor"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <Select value={currentLanguage.toString()} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-[160px] h-8 text-xs bg-background">
          <SelectValue placeholder="Lenguaje" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.id} value={lang.id.toString()} className="text-xs">
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default EditorToolbar;
