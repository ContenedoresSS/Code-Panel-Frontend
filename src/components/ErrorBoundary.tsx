import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, errorInfo.componentStack);
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-8">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold">Algo sali&oacute; mal</h1>
            <p className="text-muted-foreground text-sm">
              Ha ocurrido un error inesperado en la aplicaci&oacute;n. Intenta recargar la p&aacute;gina.
            </p>
            {this.state.error && (
              <pre className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3 w-full overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <Button onClick={this.handleReload} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Recargar p&aacute;gina
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
