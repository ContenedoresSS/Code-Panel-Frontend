import type { EditorCodeFile, EditorLenguage } from '@/types/EditorProps';
import Editor from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Download,  Upload, ALargeSmall, Sun, Moon, Circle, CheckCircle, Play} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface EditorPropsInfo{
  lenguages: EditorLenguage[];
  initialCode: EditorCodeFile;
}

export default function EditorComponent({lenguages, initialCode,}: EditorPropsInfo){

  const [lenguage, setLenguage] = useState<string>(initialCode?.lenguageId);
  const [code, setCode] = useState<string>(initialCode?.code);
	const [darkMode, setDarkMode] = useState(false);
	const [fontSizes,setFontSize] = useState<number>(14);

  useEffect(() => {
      setCode(initialCode?.code);
      setLenguage(initialCode?.lenguageId);
  },[initialCode])

  const handleLenguageSelector = (value: string) =>{
      setLenguage(value);
  }
	const toggleTheme = () => {
    setDarkMode(!darkMode);
  };
	

  return(
  <div className={`flex flex-col h-full w-full border border-border rounded-md overflow-hidden bg-background text-foreground transition-colors duration-300 ${darkMode ? 'dark' : 'light'}`}>
  
  {/* Barra Superior */}
  <div className="flex justify-between items-center p-2 bg-muted/50 border-b border-border">
	<div className='flex border rounded-md bg-background min-h-[35px] md:min-h-[40px] transition-all'>
		<span className="font-mono text-sm font-semibold px-2 text-foreground p-2 ">
      {initialCode.nameFile}
    </span>
	</div>
    <div className='flex justify-between items-center '>
      <button className='p-2 hover:bg-muted rounded-md transition-colors'  title="Descargar código">
            <Download className="w-5 h-5" />
						
          </button>
          <button className='p-2 hover:bg-muted rounded-md transition-colors'  title="Subir código">
            <Upload className="w-5 h-5" />
          </button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
								<button className='p-2 hover:bg-muted rounded-md transition-colors'  title="Cambiar tamaño de fuente">
            			<ALargeSmall className="w-5 h-5" />
								</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="center">
							<DropdownMenuItem onClick={() => setFontSize(12)}>
							12
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setFontSize(15)}>
							15
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setFontSize(18)}>
							18
							</DropdownMenuItem>
					</DropdownMenuContent>
          </DropdownMenu> 
          
          {/* 2. Nuestro botón dinámico para el tema */}
          <button 
            onClick={toggleTheme} 
            className='p-2 hover:bg-muted rounded-md transition-colors'
            title="Cambiar tema del editor"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
    </div>
    
    
    <Select value={lenguage} onValueChange={handleLenguageSelector}>
      <SelectTrigger className="w-[160px] h-8 text-xs bg-background">
      <SelectValue placeholder="Lenguaje" />
      </SelectTrigger>
      <SelectContent>
      {lenguages.map((lang) => (
        <SelectItem key={lang.id} value={lang.id} className="text-xs">
        {lang.name}
        </SelectItem>
      ))}
      </SelectContent>
    </Select>
  </div>
  
  {/* Editor usable */}
<div className="flex flex-col flex-1 overflow-hidden">
    
    {/* FILA SUPERIOR: Editor (Izq) y Output (Der) */}
    <div className="flex flex-1 overflow-hidden">
      
      {/* Editor Usable */}
      <div className="flex-1 relative border-r border-border">
        <Editor
          height="100%"
          width="100%"
          language={lenguage}
          value={code}
          theme={darkMode ? "vs-dark" : "vs-light"}
          options={{
            minimap: { enabled: false },
            fontSize: fontSizes,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      {/* Output Lateral */}
      <div className="w-[350px] flex flex-col bg-background">
        {/* Cabecera Output */}
        <div className="flex justify-between items-center p-2 border-b border-border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Output</span>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors">
            <Play className="w-3.5 h-3.5 fill-current" /> Run
          </button>
        </div>
        {/* Contenido Output */}
        <div className="p-4 flex-1 overflow-y-auto font-mono text-sm text-muted-foreground bg-muted/10">
          Esperando ejecución...
        </div>
      </div>
    </div>

    {/* FILA INFERIOR: Input (Izq) y Test Cases (Der) */}
    <div className="h-56 flex border-t border-border bg-background">
      
      {/* Input Inferior */}
      <div className="flex-1 flex flex-col border-r border-border">
        <div className="p-2 border-b border-border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Input</span>
        </div>
        <textarea 
          className="flex-1 w-full p-4 resize-none outline-none font-mono text-sm bg-transparent placeholder:text-muted-foreground/50"
          placeholder="Ingresa los valores de entrada..."
        ></textarea>
      </div>

      {/* Test Cases */}
      <div className="w-[350px] flex flex-col bg-background">
        {/* Cabecera Test Cases */}
        <div className="flex justify-between items-center p-2 border-b border-border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Test Case</span>
          <div className="flex items-center gap-2">
            <button className="text-xs font-medium px-2 py-1 hover:bg-muted rounded-md transition-colors">
              + Añadir caso
            </button>
            <button className="px-4 py-1.5 text-sm font-medium bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 rounded-md hover:opacity-90 transition-opacity">
              Test
            </button>
          </div>
        </div>
        {/* Lista de Test Cases */}
        <div className="p-3 flex flex-col gap-2 overflow-y-auto bg-muted/10">
          
          {/* Ejemplo Caso 1 (Aprobado) */}
          <div className="flex justify-between items-center p-2.5 border border-border rounded-md bg-background shadow-sm">
            <span className="text-sm font-medium">Case 1</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>

          {/* Ejemplo Caso 2 (Pendiente/Fallo) */}
          <div className="flex justify-between items-center p-2.5 border border-border rounded-md bg-background shadow-sm opacity-60">
            <span className="text-sm font-medium">Case 2</span>
            <Circle className="w-4 h-4 text-muted-foreground" />
          </div>

        </div>
      </div>

    </div>
  </div>


</div>
  );
}