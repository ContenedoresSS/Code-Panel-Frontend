import { useAuth } from "@/assets/context/AuthContext"
import { Navigate, Outlet} from "react-router"

interface RoleCuardProps {
    allowedRole : string 
}

export const RoleGuard = ({allowedRole}: RoleCuardProps) => {
    const {user, isAuthenticated, isLoading} = useAuth();

    if (isLoading) return <div className="h-screen flex items-center justify-center">Verificando permisos...</div>;

    if (!isAuthenticated){
        return <Navigate to="/" replace />;
    }

    if (user?.role !== allowedRole){
        return <Navigate to="/403" replace />;
    }
    return <Outlet />;
}