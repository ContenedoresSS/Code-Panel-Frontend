import type { EditorCodeFile, EditorLanguage } from '@/types/EditorProps';
import type { EditorExecutionResponse } from '@/types/response/EditorExecutionResponse';
import type { PublicTestCase } from '@/types/response/PublicTestCase';
import type { EvaluationResult } from '@/types/response/EvaluationResult';
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
  disableEdit?: boolean;
  disableLanguageChange?: boolean;
  disableUpload?: boolean;
  disableDownload?: boolean;
  testCases?: PublicTestCase[];
  maxAttempts?: number;
  onSubmit?: (code: string, languageId: number) => void;
  evaluationResult?: EvaluationResult | null;
  isSubmitting?: boolean;
  onAddTestCase?: () => void;
}

const MONACO_LANG_FALLBACK: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  "c++": "cpp",
  csharp: "csharp",
  "c#": "csharp",
  go: "go",
  rust: "rust",
  ruby: "ruby",
  php: "php",
  swift: "swift",
  kotlin: "kotlin",
  scala: "scala",
  r: "r",
  sql: "sql",
  lua: "lua",
  dart: "dart",
  haskell: "haskell",
  perl: "perl",
};

export default function EditorComponent({
  languages, initialCode, onChangeCode, onChangeLanguage,
  disableCopy, disablePaste, disableEdit, disableLanguageChange, disableUpload, disableDownload,
  testCases, maxAttempts, onSubmit, evaluationResult, isSubmitting, onAddTestCase,
}: EditorPropsInfo) {
  const [language, setLanguage] = useState<number>(initialCode?.languageId ?? languages[0]?.id ?? 1);
  const [code, setCode] = useState<string>(initialCode?.code || "");
  const [darkMode, setDarkMode] = useState(false);
  const [input, setInput] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(14);
  const [output, setOutput] = useState<string>("Esperando ejecución...");
  const [isExecuting, setIsExecuting] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const resolvedLang = languages.find(l => l.id === language);
  const currentLanguage = resolvedLang?.monacoId
    || MONACO_LANG_FALLBACK[resolvedLang?.name?.toLowerCase() ?? ""]
    || "plaintext";
  const currentLanguageExtension = resolvedLang?.fileExtension || "txt";

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
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { error?: string } } };
      if (err?.response?.status === 429) {
        setOutput("Límite de ejecuciones excedido. Por favor, espera cinco minutos antes de volver a intentarlo.");
        return;
      }
      if (err?.response?.data?.error) {
        setOutput(`Error: ${err.response.data.error}`);
        return;
      }
      setOutput("Error de comunicación con el servidor. Revisa tu conexión o intenta de nuevo más tarde.");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmit = () => {
    if (!code.trim() || !onSubmit) return;
    
    if (maxAttempts && maxAttempts > 0 && attemptCount >= maxAttempts) {
      setOutput("Has alcanzado el límite de intentos permitidos para esta actividad.");
      return;
    }
    
    onSubmit(code, language);
  };

  // Incrementar contador cuando hay un resultado de evaluación
  useEffect(() => {
    if (evaluationResult) {
      setAttemptCount(prev => prev + 1);
    }
  }, [evaluationResult]);

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

  const handleFileUpload = (content: string) => {
    setCode(content);
    if (onChangeCode) onChangeCode(content);
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
        disableLanguageChange={disableLanguageChange}
        disableUpload={disableUpload}
        disableDownload={disableDownload}
        onFileUpload={handleFileUpload}
        getCodeForDownload={() => code}
        currentLanguageExtension={currentLanguageExtension}
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
            disableEdit={disableEdit}
          />
          <OutputPanel
            output={output}
            isExecuting={isExecuting}
            onRun={handleRunCode}
            evaluationResult={evaluationResult}
          />
        </div>

        <div className="h-56 flex border-t border-border bg-background">
          <InputPanel input={input} onChange={setInput} />
          <TestCasesPanel
            testCases={testCases}
            evaluationResult={evaluationResult}
            onSubmit={onSubmit ? handleSubmit : undefined}
            isSubmitting={isSubmitting}
            maxAttempts={maxAttempts}
            attemptCount={attemptCount}
            onAddTestCase={onAddTestCase}
          />
        </div>
      </div>
    </div>
  );
}
