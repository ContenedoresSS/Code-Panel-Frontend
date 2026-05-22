
import { BookOpen, FileText } from "lucide-react";
import { StatCard } from "@/components/CardInfo";
import { useAuth } from "@/assets/context/AuthContext";
export default function Dashboard( ) {
    const {user} =useAuth()
return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-5xl mx-auto p-4">
      
      <div className="w-full text-left md:text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
          Bienvenido {user?.name}.
          </h1>
          <p className="text-lg text-muted-foreground">
          Aquí tienes un resumen de tu actividad académica hoy.
          </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          
          <StatCard 
          title="Total de Cursos" 
          value="7" 
          icon={<BookOpen className="size-8" />} 
          iconBgClass="bg-emerald-500/10 dark:bg-emerald-500/20" 
          iconColorClass="text-emerald-600 dark:text-emerald-400"
          />

          <StatCard 
          title="Total de Plantillas" 
          value="55" 
          icon={<FileText className="size-8" />} 
          iconBgClass="bg-blue-500/10 dark:bg-blue-500/20" 
          iconColorClass="text-blue-600 dark:text-blue-400"
          />

      </div>
      </div>
  );
}