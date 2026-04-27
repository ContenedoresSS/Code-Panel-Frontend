import RegisterForm from "@/components/RegisterForm";
import { NavLink } from "react-router";
import { Code } from 'lucide-react';
export default function Register () {

    return(
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
    
    <div className="flex flex-col items-center justify-center bg-[#C5D3D1] p-12 lg:p-24 text-center">
        <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#0D1621] text-white p-3 rounded-xl">
                <Code/>
            </div>
            <h1 className="text-4xl font-bold text-[#0D1621]">CodePanel</h1>
        </div>
        
        <div className="max-w-md">
            <span className="text-lg leading-relaxed text-[#0D1621] opacity-90">
                Code Panel es la herramienta de administración encargada de aprovisionar y gestionar el editor de código.
            </span>
        </div>
    </div>
    
    <div className="flex flex-col items-center bg-white p-6 md:p-10 lg:p-12 min-h-screen">
        <div className="w-full flex justify-end">
            <img 
                src="/luady.svg" 
                alt="Logo Luady"
                
                className="w-20 h-auto md:w-17 lg:w-20 transition-all duration-300 mb-2" 
            />
        </div>
        <div className="w-full max-w-lg">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-[#0D1621] mb-2">Registro</h1>
                <p className="text-base text-gray-600">
                    Crea una cuenta para comenzar a gestionar tus proyectos.
                </p>
            </div>
            
            <div className="w-full">
                <RegisterForm />
            </div>
            
            <div className="mt-8 text-center text-sm text-gray-600">
                ¿Ya tienes cuenta? <NavLink to={ "/"} className="font-semibold text-[#0D1621] hover:underline">Inicia Sesión</NavLink>
            </div>
        </div>
    </div>
    
</div>
    );
}
