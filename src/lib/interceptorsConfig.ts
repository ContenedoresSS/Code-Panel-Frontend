import type { AxiosInstance } from "axios";
import { TokenService } from "@/service/TokenService";
import { refreshAccesToken } from "@/service/AuthService";

export const interceptorsConfig =(api: AxiosInstance) => {

//token headers
api.interceptors.request.use((config)=>{
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
            }
        }
        return Promise.reject(error);
    }
);

//manejo de errores
api.interceptors.response.use(response => response,
    error =>{
        const status = error.response ? error.response.status : null;

        if(status === 401){

        }else if(status === 404){

        }else if (status===500){

        }
    }
)


}