import api from '../lib/axios'
import type { RegisterDTO } from '@/types/request/RegisterRequest';
import type { RegisterResponse} from '@/types/response/RegisterResponse';
import type { AuthResponse } from '@/types/response/AuthResponse';
import type { LoginDTO } from '@/types/request/LoginRequest';

export const registerUser  = async(userData: RegisterDTO): Promise <RegisterResponse>  => {
    const response = await api.post<RegisterResponse>('/auth/register', userData);
    return response.data;
}

export const loginUser = async(credentials: LoginDTO): Promise <AuthResponse> =>{
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
}

export const refreshAccesToken = async(refreshToken:string) : Promise <AuthResponse> =>{
    const response = await api.post<AuthResponse>('/auth/refreshSession',refreshToken);
    return response.data;
    
}