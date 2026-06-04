import { useSearchParams } from 'react-router';
import EditorComponent from '../components/EditorComponent';

export default function EmbedEditor() {
  const [searchParams] = useSearchParams();
  
  // Puedes leer parámetros de la URL de tu iframe, por ejemplo:
  // <iframe src="/embed/editor?lang=1" />
  const langIdParam = searchParams.get('lang');

  // Aquí deberías cargar tus lenguajes desde tu estado, contexto o API
  const lenguajesSoportados = [
    { id: 1, name: "JavaScript", monacoId: "javascript" },
    { id: 2, name: "Python", monacoId: "python" },
    { id: 3, name: "TypeScript", monacoId: "typescript" },
  ];

  // Configuración inicial basada en la URL (Opcional)


  return (
    // CAMBIO AQUÍ: absolute inset-0 w-full h-full
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-background">
      <EditorComponent 
        languages={lenguajesSoportados}  
      />
    </div>
  );
}