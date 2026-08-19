import { useState } from "react";
import { FileCode2, Play, Plus, X } from "lucide-react";
import type { EditorFile } from "@/types/EditorProps";

interface FileTabsProps {
  files: EditorFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onAddFile: () => void;
  onRemoveFile: (id: string) => void;
  onRenameFile: (id: string, name: string) => void;
  disabled?: boolean;
}

export function FileTabs({
  files,
  activeFileId,
  onSelectFile,
  onAddFile,
  onRemoveFile,
  onRenameFile,
  disabled,
}: FileTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const startRename = (file: EditorFile) => {
    if (disabled) return;
    setEditingId(file.id);
    setDraftName(file.nameFile);
  };

  const commitRename = () => {
    if (editingId) {
      const name = draftName.trim();
      if (name && !files.some((f) => f.id !== editingId && f.nameFile === name)) {
        onRenameFile(editingId, name);
      }
    }
    setEditingId(null);
    setDraftName("");
  };

  return (
    <div className="flex items-center gap-1 px-2 pt-2 bg-muted/50 border-b border-border overflow-x-auto">
      {files.map((file, index) => {
        const isActive = file.id === activeFileId;
        const isEntryPoint = index === 0;

        return (
          <div
            key={file.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectFile(file.id)}
            onDoubleClick={() => startRename(file)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSelectFile(file.id);
            }}
            className={`group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-b-0 rounded-t-md cursor-pointer transition-colors select-none ${
              isActive
                ? "bg-background text-foreground border-border"
                : "bg-transparent text-muted-foreground border-transparent hover:bg-muted"
            }`}
            title={isEntryPoint ? `${file.nameFile} (archivo de entrada)` : file.nameFile}
          >
            {isEntryPoint ? (
              <Play className="w-3 h-3 text-primary shrink-0" />
            ) : (
              <FileCode2 className="w-3 h-3 shrink-0" />
            )}

            {editingId === file.id ? (
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") setEditingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-24 bg-background border border-border rounded px-1 py-0.5 text-xs outline-none"
              />
            ) : (
              <span className="whitespace-nowrap">{file.nameFile}</span>
            )}

            {files.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(file.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                title="Cerrar archivo"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}

      {!disabled && (
        <button
          onClick={onAddFile}
          className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-t-md"
          title="Añadir archivo"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default FileTabs;
