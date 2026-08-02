import Editor from "@monaco-editor/react";

interface EditorPaneProps {
  language: string;
  code: string;
  onChange: (value: string) => void;
  darkMode: boolean;
  fontSize: number;
}

export function EditorPane({
  language,
  code,
  onChange,
  darkMode,
  fontSize,
}: EditorPaneProps) {
  return (
    <div className="flex-1 relative border-r border-border">
      <Editor
        height="100%"
        width="100%"
        language={language}
        value={code}
        onChange={(val) => onChange(val || "")}
        theme={darkMode ? "vs-dark" : "vs-light"}
        options={{
          minimap: { enabled: false },
          fontSize: fontSize,
          padding: { top: 16 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}

export default EditorPane;
