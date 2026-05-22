import { useAuth } from "@/assets/context/AuthContext"
import { Navigate, Outlet} from "react-router";

export const ProtectedRoute = () =>{
    const {isAuthenticated, isLoading} = useAuth();

    if(isLoading){
        return <div className="h-screen flex items-center justify-center">Cargando sistema...</div>;
    }

    if (!isAuthenticated){
        return <Navigate to="" replace/>
    }

    return <Outlet/>
}