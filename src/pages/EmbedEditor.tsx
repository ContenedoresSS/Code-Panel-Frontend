import EditorComponent from '../components/EditorComponent';

export default function EmbedEditor() {

  const lenguajesSoportados = [
    { id: 1, name: "JavaScript", monacoId: "javascript", fileExtension: "js" },
    { id: 2, name: "Python", monacoId: "python", fileExtension: "py" },
    { id: 3, name: "TypeScript", monacoId: "typescript", fileExtension: "ts" },
  ];

  return (

    <div className="absolute inset-0 w-full h-full overflow-hidden bg-background">
      <EditorComponent 
        languages={lenguajesSoportados}  
      />
    </div>
  );
}