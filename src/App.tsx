
import { Route, Routes } from 'react-router'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'
import { Toaster } from "@/components/ui/sonner";
import { Navigate } from 'react-router';
import Dashboard from './pages/Dashboard';

function App() {
  
  return (
    <>
    <Routes>
        <Route path="/" >
          <Route index element={<Navigate to="/login" replace/>} />
          <Route path='login' element={<Login/>}/>
          <Route path="register" element={<Register />} />
        </Route>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App
