import EditorComponent from '@/components/EditorComponent';
import { Button } from '@/components/ui/button';
import type { EditorCodeFile, EditorLanguage } from '@/types/EditorProps';
import { useEffect } from 'react';

export default function Course(){

  const SUPPORTED_LANGUAGES: EditorLanguage[] = [
  { id: 1, monacoId:'cpp', name: 'C++ (gcc 13.2)' },
    { id: 2, monacoId:'python', name: 'Python (3.11)' },
    { id: 3, monacoId:'javascript', name: 'Node.js (20)'}
  ];


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
          languages={SUPPORTED_LANGUAGES}
      />
  

  </div>
  );
}