import api from '../lib/axios'
import type { RegisterDTO, AuthResponse,LoginDTO, MessageResponse} from '@/types/Authentication';

export const registerUser  = async(userData: RegisterDTO): Promise <MessageResponse>  => {
    const response = await api.post<MessageResponse>('/auth/register', userData);
    return response.data;
}

export const loginUser = async(credentials: LoginDTO): Promise <AuthResponse> =>{
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
}