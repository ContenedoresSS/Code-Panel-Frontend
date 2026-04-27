import type { AxiosInstance } from "axios";
import { TokenService } from "@/service/TokenService";
import { refreshAccesToken } from "@/service/AuthService";
import { toast } from "sonner"

export const interceptorsConfig =(api: AxiosInstance) => {

//token headers
api.interceptors.request.use((config)=>{

    if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
        return config;
    }

    const token = TokenService.getAccesToken();
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
})

//refresh token
api.interceptors.response.use(response => response,
    async error =>{
        const originalRequest = error.config;


        if(error.response.status === 401 && !originalRequest._retry){
            originalRequest._retry = true;

            try {
                const refreshToken = TokenService.getRefreshToken();
                if (!refreshToken) throw new Error("No hay refresh token");
                const response = await refreshAccesToken(refreshToken);
            
                const {token, refreshToken: newRefreshToken} = response;
                
                TokenService.setTokens(token, newRefreshToken);
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
                
            } catch (error) {
                console.error('Token refresh failed:', error);
                TokenService.removeTokens();
                window.location.href = "/";
                toast.error("Error 401: Credenciales invalidas o Session Expirada",{
                description: "Por favor verifica tus credenciales",
                })
            }
        }
        return Promise.reject(error);
    }
);

//manejo de errores
api.interceptors.response.use(response => response,
    error =>{
        const status = error.response ? error.response.status : null;

        if(status === 404){
            toast. error("Error 404: Recurso no Encontrado",{
                description: status,
            })
        }else if (status===500){
            toast. error("Error 500: Error del servidor",{
                description:status,
            })
        }else if (status===403){
            window.location.href = "/dashboard";
            toast. error("Error 403: Acceso denegado",{
                description:status,
            })
            
        }
        return Promise.reject(error);
    }
)


}