import { NavLink } from "react-router";
import {LoginForm} from "@/components/LoginForm"
import { Code } from 'lucide-react';



export default function Login () {

    return(
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 font-sans">
        <div className="flex flex-col items-center bg-white p-6 md:p-10 lg:p-12 min-h-screen">
            <div className="w-full flex justify-start">
                <img 
                    src="/luady.svg" 
                    alt="Logo Luady"
                    className="w-20 h-auto md:w-17 lg:w-20 transition-all duration-300 mb-8" 
                />
            </div>
            <div className="w-full max-w-md">
            
                <div className="mb-10 text-left">
                <h1 className="text-4xl font-extrabold text-[#0D1621] mb-2 tracking-tight">
                    Inicio de Sesión
                </h1>
                <p className="text-base text-gray-500 font-medium">
                    Introduce tus credenciales para acceder
                </p>
            </div>

            <div className="w-full">
                <LoginForm />
            </div>
            <div className="mt-10 text-center text-sm text-gray-600">
                ¿No tienes cuenta?{" "}
                <NavLink 
                    to="/register" 
                    className="font-bold text-[#0D1621] hover:underline transition-all"
                >
                    Regístrate
                </NavLink>
            </div>
            
        </div>
    </div>

        <div className="hidden md:flex flex-col items-center justify-center bg-[#C5D3D1] p-12 lg:p-24 text-center">
        <div className="max-w-sm">
            <div className="flex items-center justify-center gap-4 mb-8">
                <div className="bg-[#0D1621] text-white p-3.5 rounded-2xl shadow-xl">
                    <Code/>
                </div>
                <span className="text-5xl font-bold text-[#0D1621] tracking-tighter">
                    CodePanel
                </span>
            </div>

            <div className="px-6">
            <p className="text-lg leading-relaxed text-[#0D1621] opacity-90">
                Accede al panel administrativo para comenzar a gestionar el editor de código.
            </p>
            </div>
        </div>
        </div>
    </div>
    );
}

