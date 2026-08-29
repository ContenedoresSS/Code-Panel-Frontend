import { useRef, useCallback } from "react";
import { Download, Upload, ALargeSmall, Sun, Moon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { EditorLanguage } from "@/types/EditorProps";

interface EditorToolbarProps {
  fileName: string;
  darkMode: boolean;
  onToggleTheme: () => void;
  onChangeFontSize: (size: number) => void;
  languages: EditorLanguage[];
  currentLanguage: number;
  onLanguageChange: (value: string) => void;
  disableLanguageChange?: boolean;
  disableUpload?: boolean;
  disableDownload?: boolean;
  onFileUpload?: (content: string) => void;
  getCodeForDownload?: () => string;
  currentLanguageExtension?: string;
}

export function EditorToolbar({
  fileName,
  darkMode,
  onToggleTheme,
  onChangeFontSize,
  languages,
  currentLanguage,
  onLanguageChange,
  disableLanguageChange,
  disableUpload,
  disableDownload,
  onFileUpload,
  getCodeForDownload,
  currentLanguageExtension,
}: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onFileUpload) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === "string") {
          onFileUpload(content);
        }
      };
      reader.readAsText(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onFileUpload]
  );

  const handleDownloadClick = useCallback(() => {
    if (!getCodeForDownload) return;

    const code = getCodeForDownload();
    const ext = currentLanguageExtension || "txt";
    const baseName = fileName.replace(/\.[^.]+$/, "");
    const downloadFileName = `${baseName}.${ext}`;

    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [getCodeForDownload, currentLanguageExtension, fileName]);

  return (
    <div className="flex justify-between items-center p-2 bg-muted/50 border-b border-border">
      <div className="flex border rounded-md bg-background min-h-[35px] md:min-h-[40px] transition-all">
        <span className="font-mono text-sm font-semibold px-2 text-foreground p-2">{fileName}</span>
      </div>

      <div className="flex justify-between items-center">
        {!disableDownload && (
          <button
            className="p-2 hover:bg-muted rounded-md transition-colors"
            title="Descargar código"
            onClick={handleDownloadClick}
          >
            <Download className="w-5 h-5" />
          </button>
        )}

        {!disableUpload && (
          <>
            <button
              className="p-2 hover:bg-muted rounded-md transition-colors"
              title="Subir código"
              onClick={handleUploadClick}
            >
              <Upload className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".txt,.js,.ts,.py,.java,.c,.cpp,.cs,.go,.rs,.rb,.php,.swift,.kt,.scala,.r,.sql,.sh,.pl,.lua,.dart,.hs"
              onChange={handleFileChange}
            />
          </>
        )}

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
            <DropdownMenuItem onClick={() => onChangeFontSize(12)}>12</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeFontSize(15)}>15</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeFontSize(18)}>18</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          data-rat-theme
          onClick={onToggleTheme}
          className="p-2 hover:bg-muted rounded-md transition-colors"
          title="Cambiar tema del editor"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <Select value={currentLanguage.toString()} onValueChange={onLanguageChange}>
        <SelectTrigger
          className="w-[160px] h-8 text-xs bg-background"
          disabled={disableLanguageChange}
        >
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
