import Editor from "@monaco-editor/react";

interface EditorPaneProps {
  language: string;
  code: string;
  onChange: (value: string) => void;
  darkMode: boolean;
  fontSize: number;
  disableCopy?: boolean;
  disablePaste?: boolean;
  disableEdit?: boolean;
}

export function EditorPane({
  language,
  code,
  onChange,
  darkMode,
  fontSize,
  disableCopy,
  disablePaste,
  disableEdit,
}: EditorPaneProps) {
  function handleEditorDidMount(_editor: unknown, monaco: unknown) {
    const editor = _editor as Record<string, unknown>;
    const m = monaco as Record<string, unknown>;
    const KeyMod = m.KeyMod as Record<string, number>;
    const KeyCode = m.KeyCode as Record<string, number>;

    if (disableCopy) {
      (editor as any).addCommand(KeyMod.CtrlCmd | KeyCode.KeyC, () => {});
      (editor as any).addCommand(KeyMod.CtrlCmd | KeyCode.KeyX, () => {});
    }
    if (disablePaste) {
      (editor as any).addCommand(KeyMod.CtrlCmd | KeyCode.KeyV, () => {});
    }
  }

  return (
    <div className="flex-1 relative border-r border-border">
      <Editor
        height="100%"
        width="100%"
        language={language}
        value={code}
        onChange={(val) => onChange(val || "")}
        theme={darkMode ? "vs-dark" : "vs-light"}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: fontSize,
          padding: { top: 16 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly: disableEdit,
          contextmenu: !(disableCopy && disablePaste),
        }}
      />
    </div>
  );
}

export default EditorPane;
