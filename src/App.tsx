
import { Route, Routes } from 'react-router'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'
import { Toaster } from "@/components/ui/sonner";


function App() {
  
  return (
    <>
    <Routes>
      <Route path='/' element={<Login/>} />
      <Route path='/register' element={<Register/>} />
    </Routes>
    <Toaster />
    </>
  )
}

export default App
