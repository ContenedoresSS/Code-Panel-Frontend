
import { Route, Routes } from 'react-router'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'
import { Toaster } from "@/components/ui/sonner";
import { Navigate } from 'react-router';
import DashboardLayout from './pages/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Setting from './pages/Setting';
import Course from './pages/Course';
import Student from './pages/Student';
import Access from './pages/Access';
import { ThemeProvider } from './components/theme-provider';
import { RoleGuard } from './guards/RoleGuard';
import { ProtectedRoute } from './guards/ProtectedRoute';
import Language from './pages/Language';
import EmbedEditor from './pages/EmbedEditor';
import SubjectDetailView from './pages/CourseDetailView';
import CreateActivityView from './pages/CreateActivityView';
import EditActivityView from './pages/EditActivityView';

function App() {
  
  return (
  <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Routes>
        <Route path="/embed/editor" element={<EmbedEditor />} />
        <Route path="/">
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="403" element={<div className="p-10 text-center text-red-500 font-bold text-2xl">403 - Acceso Denegado</div>} />
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<Dashboard/>} />
            <Route path="setting" element={<Setting />} />
            <Route path="student" element={<Student/>} />
            <Route path="course" element={<Course />} />
              <Route path="/subject/:id" element={<SubjectDetailView />} />
              <Route path="/subject/:id/activity/new" element={<CreateActivityView />} />
              <Route path="/subject/:id/activity/:activityId/edit" element={<EditActivityView />} />

            <Route element={<RoleGuard allowedRole="God" />}>
              <Route path="access" element={<Access />} />
              <Route path="language" element={<Language/>} />
            </Route>
          </Route>
        </Route>
      </Routes>
      
      <Toaster richColors />
    </ThemeProvider>
  )
}

export default App
