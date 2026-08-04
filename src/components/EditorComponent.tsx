import type { EditorCodeFile, EditorLanguage } from '@/types/EditorProps';
import type { EditorExecutionResponse } from '@/types/response/EditorExecutionResponse';
import { useEffect, useState } from 'react';
import { executionCode } from '@/service/EditorService';
import { encodeToBase64 } from '@/utils/base64.util';
import { ExecutionStatus } from '@/types/enum/ExecutionStatus';
import { EditorToolbar } from './editor/EditorToolbar';
import { EditorPane } from './editor/EditorPane';
import { OutputPanel } from './editor/OutputPanel';
import { InputPanel } from './editor/InputPanel';
import { TestCasesPanel } from './editor/TestCasesPanel';

interface EditorPropsInfo {
  languages: EditorLanguage[];
  initialCode?: EditorCodeFile;
  onChangeCode?: (code: string) => void;
  onChangeLanguage?: (languageId: number) => void;
  disableCopy?: boolean;
  disablePaste?: boolean;
}

export default function EditorComponent({ languages, initialCode, onChangeCode, onChangeLanguage, disableCopy, disablePaste }: EditorPropsInfo) {
  const [language, setLanguage] = useState<number>(initialCode?.languageId ?? languages[0]?.id ?? 1);
  const [code, setCode] = useState<string>(initialCode?.code || "");
  const [darkMode, setDarkMode] = useState(false);
  const [input, setInput] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(14);
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
    if (!code.trim()) {
      setOutput("El editor está vacío. Escribe algo de código antes de ejecutar.");
      return;
    }
    setIsExecuting(true);
    setOutput("Compilando y ejecutando...");

    try {
      const payload = {
        languageId: language,
        code: encodeToBase64(code),
        stdin: encodeToBase64(input),
      };
      const result: EditorExecutionResponse = await executionCode(payload);
      let formattedOutput = "";

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
    } catch (error: any) {
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
  };

  const handleLanguageSelector = (value: string) => {
    const newLangId = Number(value);
    setLanguage(newLangId);
    if (onChangeLanguage) onChangeLanguage(newLangId);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleCodeChange = (val: string) => {
    setCode(val);
    if (onChangeCode) onChangeCode(val);
  };

  return (
    <div className={`flex flex-col h-full w-full border border-border rounded-md overflow-hidden bg-background text-foreground transition-colors duration-300 ${darkMode ? 'dark' : 'light'}`}>
      <EditorToolbar
        fileName={initialCode?.nameFile ?? "Nuevo Archivo"}
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        onChangeFontSize={setFontSize}
        languages={languages}
        currentLanguage={language}
        onLanguageChange={handleLanguageSelector}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          <EditorPane
            language={currentLanguage}
            code={code}
            onChange={handleCodeChange}
            darkMode={darkMode}
            fontSize={fontSize}
            disableCopy={disableCopy}
            disablePaste={disablePaste}
          />
          <OutputPanel
            output={output}
            isExecuting={isExecuting}
            onRun={handleRunCode}
          />
        </div>

        <div className="h-56 flex border-t border-border bg-background">
          <InputPanel input={input} onChange={setInput} />
          <TestCasesPanel />
        </div>
      </div>
    </div>
  );
}
