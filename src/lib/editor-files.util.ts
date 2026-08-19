import type { EditorFile } from "@/types/EditorProps";
import type { CodeFile } from "@/types/CodeFile";
import { encodeToBase64 } from "@/utils/base64.util";

export function toCodeFiles(files: EditorFile[]): CodeFile[] {
  return files.map((file) => ({
    name: file.nameFile,
    content: encodeToBase64(file.code),
  }));
}
