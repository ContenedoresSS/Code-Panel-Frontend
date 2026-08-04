interface InputPanelProps {
  input: string;
  onChange: (value: string) => void;
}

export function InputPanel({ input, onChange }: InputPanelProps) {
  return (
    <div className="flex-1 flex flex-col border-r border-border">
      <div className="p-2 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Input
        </span>
      </div>
      <textarea
        className="flex-1 w-full p-4 resize-none outline-none font-mono text-sm bg-transparent placeholder:text-muted-foreground/50"
        placeholder="Ingresa los valores de entrada..."
        value={input}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default InputPanel;
