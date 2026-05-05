import EditorComponent from '@/components/EditorComponent';
import { Button } from '@/components/ui/button';
import type { EditorCodeFile, EditorLenguage } from '@/types/EditorProps';
import { useEffect } from 'react';

export default function Course(){

  const SUPPORTED_LANGUAGES: EditorLenguage[] = [
  { id: 'java', name: 'Java' },
  { id: 'python', name: 'Python 3' },
  { id: 'javascript', name: 'JavaScript (Node.js)' },
  ];

  const INITIAL_FILE: EditorCodeFile = {
  id: 'file-001',
  nameFile: 'Problem1.js',
  lenguageId: 'javascript',
  code: '// Escribe tu código aquí...\nfunction solution(input) {\n    // Procesa los datos\n    return input;\n}'
  };

  useEffect(() => {

  })

  return(

      <div className="flex flex-col h-[calc(100vh-4rem)] p-6 bg-muted/20">
  
  {/* Encabezado del curso/problema */}
  <div className="flex justify-between items-center mb-4">
      <div>
      <h1 className="text-2xl font-bold tracking-tight">Fundamentos de Clases</h1>
      <p className="text-sm text-muted-foreground">
          Escribe una breve descripción del ejercicio...
      </p>
      </div>
      
  </div>


      <EditorComponent 
          lenguages={SUPPORTED_LANGUAGES}
          initialCode={INITIAL_FILE}
      />
  

  </div>
  );
}