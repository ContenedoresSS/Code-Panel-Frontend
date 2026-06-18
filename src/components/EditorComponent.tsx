import type { EditorCodeFile, EditorLanguage } from '@/types/EditorProps';
import type { EditorExecutionResponse } from '@/types/response/EditorExecutionResponse';
import Editor from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Download,  Upload, ALargeSmall, Sun, Moon, Circle, CheckCircle, Play} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { executionCode } from '@/service/EditorService';
import { Button } from './ui/button';
import { encodeToBase64 } from '@/utils/base64.util';
import { ExecutionStatus } from '@/types/enum/ExecutionStatus';

interface EditorPropsInfo{
  languages: EditorLanguage[];
  initialCode?: EditorCodeFile;
  onChangeCode?: (code: string) => void;
  onChangeLanguage?: (languageId: number) => void;
}

export default function EditorComponent({languages, initialCode, onChangeCode, onChangeLanguage}: EditorPropsInfo){

  const [language, setLanguage] = useState<number>(initialCode?.languageId ?? languages[0]?.id ?? 1);
  const [code, setCode] = useState<string>(initialCode?.code || "");
	const [darkMode, setDarkMode] = useState(false);
  const [input, setInput] = useState<string>("");
	const [fontSizes,setFontSize] = useState<number>(14);
  const [output, setOutput] = useState<string>("Esperando ejecución...");
  const [isExecuting, setIsExecuting] = useState(false);
  const currentLanguage = languages.find(l => l.id === language)?.monacoId || "plaintext";

useEffect(() => {
    if (initialCode) {
      setLanguage(initialCode.languageId);
      
      setCode((prevCode) => {
        if (prevCode === "" || prevCode !== initialCode.code) {
          return initialCode.code;
        }
        return prevCode;
      });
    }

  }, [initialCode]);

  

  const handleRunCode = async () => {
    if (!code.trim()){
      setOutput(" El editor está vacío. Escribe algo de código antes de ejecutar.");
      return;
    }
    setIsExecuting(true);
    setOutput("Compilando y ejecutando...");

    try {
      const payload = {
        languageId: language,
        code: encodeToBase64(code),
        stdin: encodeToBase64(input)
      };
    const result: EditorExecutionResponse = await executionCode(payload);
    let formattedOutput = "ola";

    switch (result.status) {
        case ExecutionStatus.SUCCESS:
          formattedOutput = result.stdout;
          formattedOutput += `\n\nEjecución exitosa en ${result.timeMs} ms.`;
          break;
          
        case ExecutionStatus.COMPILE_ERROR:
          formattedOutput = `Error de Compilación:\n\n${result.stderr}`;
          break;
          
        case ExecutionStatus.RUNTIME_ERROR:
          formattedOutput = `Error de Ejecución (Runtime Error):\n\n${result.stderr}`;
          if (result.stdout) {
            formattedOutput += `\n\nSalida estándar parcial:\n${result.stdout}`;
          }
          break;
          
        case ExecutionStatus.TIME_LIMIT_EXCEEDED:
          formattedOutput = `Límite de Tiempo Excedido.\nTu código tardó más de 10 segundos en ejecutarse. Revisa si tienes un bucle infinito (while/for) o si estás esperando un input que no proporcionaste.`;
          break;
          
        default:
          formattedOutput = "Estado de ejecución desconocido.";
      }

      setOutput(formattedOutput);

    }catch(error: any){
      if (error?.response?.status === 429) {
        setOutput("Límite de ejecuciones excedido. Por favor, espera cinco minutos antes de volver a intentarlo.");
        return;
      }

      if (error?.response?.data?.error) {
        setOutput(`Error: ${error.response.data.error}`);
        return;
      }

      setOutput("Error de comunicación con el servidor. Revisa tu conexión o intenta de nuevo más tarde.");
    } finally {
      setIsExecuting(false);
    }

  }

  const handleLanguageSelector = (value: string) => {
    const newLangId = Number(value);
    setLanguage(newLangId);
    if (onChangeLanguage) onChangeLanguage(newLangId);
  };

	const toggleTheme = () => {
    setDarkMode(!darkMode);
  };
	

  return(
  <div className={`flex flex-col h-full w-full border border-border rounded-md overflow-hidden bg-background text-foreground transition-colors duration-300 ${darkMode ? 'dark' : 'light'}`}>
  
  {/* Barra Superior */}
  <div className="flex justify-between items-center p-2 bg-muted/50 border-b border-border">
	<div className='flex border rounded-md bg-background min-h-[35px] md:min-h-[40px] transition-all'>
		<span className="font-mono text-sm font-semibold px-2 text-foreground p-2 ">
      {initialCode?.nameFile ?? "Nuevo Archivo"}
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
    
    
    <Select value={language.toString()} onValueChange={handleLanguageSelector}>
      <SelectTrigger className="w-[160px] h-8 text-xs bg-background">
      <SelectValue placeholder="Lenguaje" />
      </SelectTrigger>
      <SelectContent>
      {languages.map((lang) => (
        <SelectItem key={lang.id} value={lang.id.toString()} className="text-xs">
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
          language={currentLanguage}
          value={code}
          onChange={(val) => {
            const newValue = val || "";
            setCode(newValue);
            if (onChangeCode) onChangeCode(newValue); // Avisamos al padre
          }}
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
          <Button 
            onClick={handleRunCode}
            disabled={isExecuting}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-border rounded-md transition-colors ${
              isExecuting 
                ? 'bg-muted opacity-50 cursor-not-allowed' 
                : 'hover:bg-muted'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-pulse' : 'fill-current'}`} /> 
            {isExecuting ? 'Running...' : 'Run'}
          </Button>
        </div>
        {/* Contenido Output */}
        <div className="p-4 flex-1 overflow-y-auto font-mono text-sm text-muted-foreground bg-muted/10 whitespace-pre-wrap">
          {output}
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
          value={input}                                   
          onChange={(e) => setInput(e.target.value)}  
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