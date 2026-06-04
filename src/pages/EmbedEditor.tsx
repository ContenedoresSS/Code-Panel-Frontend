import { useSearchParams } from 'react-router';
import EditorComponent from '../components/EditorComponent';

export default function EmbedEditor() {
  const [searchParams] = useSearchParams();
  
  
  const langIdParam = searchParams.get('lang');

  const lenguajesSoportados = [
    { id: 1, name: "JavaScript", monacoId: "javascript" },
    { id: 2, name: "Python", monacoId: "python" },
    { id: 3, name: "TypeScript", monacoId: "typescript" },
  ];

  return (

    <div className="absolute inset-0 w-full h-full overflow-hidden bg-background">
      <EditorComponent 
        languages={lenguajesSoportados}  
      />
    </div>
  );
}