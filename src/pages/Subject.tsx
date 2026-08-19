import { useState, useEffect } from "react";
import { CourseCard} from "@/components/SubjectCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Loader2 } from "lucide-react";
import { CreateSubjectModal, } from "@/components/CreateSubjectModal";
import type { SubjectResponse } from "@/types/response/SubjectResponse";
import { createSubject, deleteSubject, getSubjectsByUser, updateSuject } from "@/service/SubjectService";
import { toast } from "sonner";
import type { CreateSubjectRequest } from "@/types/request/CreateSubjectRequest";
import { useNavigate } from "react-router";
import { EditSubjecteModal } from "@/components/EditSubjectModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";



export default function Subject() {
  const [courses, setCourses] = useState<SubjectResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<SubjectResponse | null>(null);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
   const fetchSubjects = async () => {
    try {
      setIsLoading(true)
      const subjectsData = await getSubjectsByUser();
      setCourses(subjectsData);
    } catch {
      toast.error("Error al cargar las materias")
    }finally{
      setIsLoading(false)
    }
   }

   fetchSubjects();
  }, []);


  const handleEnterSubject = (id: number | string) => {
    navigate(`/subject/${id}`);
  };

  const handleSaveNewSubject = async (newCourseData: CreateSubjectRequest) => {
    try {
      const newSubject = await createSubject(newCourseData);
      
      
      setCourses([newSubject, ...courses]);
      toast.success("Materia añadida exitosamente") 
      setIsCreateModalOpen(false);
    } catch {
      toast.error("Error al crear la materia:");
    }
  };



const handleEditSubject = (id: number | string) => {
    // Buscamos el curso exacto que el usuario quiere editar
    const course = courses.find(c => c.id === id);
    if (course) {
      setCourseToEdit(course); // Guardamos los datos del curso
      setIsEditModalOpen(true); // Abrimos el modal
    }
  };

  // <-- 4. Lógica para GUARDAR los cambios en el backend
  const handleUpdateSubject = async (id: number , updatedCourseData: CreateSubjectRequest) => {
    try {
      // Llamamos al servicio (que usa PUT /api/v1/subject/:id)
      const updatedSubject = await updateSuject(id, updatedCourseData)
      
      // Actualizamos solo el curso modificado en nuestro estado local
      setCourses(courses.map(course => 
        course.id === id ? updatedSubject : course
      ));
      
      toast.success("Materia actualizada exitosmanete")
      setCourseToEdit(null);
      setIsEditModalOpen(false);
    } catch {
      toast.error("Error al actualizar la materia");
    }
  };

const handleDeleteSubject = (id: number | string) => {
  setDeleteId(id);
};

const confirmDelete = async () => {
  if (!deleteId) return;
  try {
    await deleteSubject(deleteId);
    setCourses(courses.filter(course => course.id !== deleteId));
    toast.success("Materia eliminada correctamente");
  } catch {
    toast.error("Error al eliminar la materia");
  } finally {
    setDeleteId(null);
  }
};

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    
  <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Mis Cursos</h1>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Curso
        </Button>
      </div>

      <div className="relative mb-8 max-w-md w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar cursos..." 
          className="pl-9 bg-background"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onAction={handleEnterSubject}
              onEdit={handleEditSubject}     
              onDelete={handleDeleteSubject} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg border-dashed border-border bg-muted/20">
          <p className="text-muted-foreground">
            {searchTerm ? "No se encontraron cursos que coincidan con tu búsqueda." : "Aún no tienes cursos creados."}
          </p>
        </div>
      )}

      {/* Modal de Creación */}
      <CreateSubjectModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleSaveNewSubject}
      />

      {/* <-- 5. Instanciamos el Modal de Edición */}
      <EditSubjecteModal 
        key={courseToEdit?.id ?? "new"}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setCourseToEdit(null);
        }}
        onSubmit={handleUpdateSubject}
        course={courseToEdit}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Eliminar Curso"
        description="¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
