
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
import { ThemeProvider } from './components/theme-provider';


function App() {
  
  return (
  <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Routes>
        <Route path="/" >
          <Route index element={<Navigate to="/login" replace/>} />
          <Route path='login' element={<Login/>}/>
          <Route path="register" element={<Register />} />
        </Route>
        
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="setting" element={<Setting />} />
          <Route path="student" element={<Student/>} />
          <Route path="course" element={<Course />} />
        </Route>
      </Routes>
      
      <Toaster richColors />
    </ThemeProvider>
  )
}

export default App
