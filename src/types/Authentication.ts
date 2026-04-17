export interface RegisterDTO{
    name: string;
    lastName:string;
    email:string;
    password:string;
    clave: string;
    code: string;
}

export interface LoginDTO{
    email:string;
    password:string;
}

export interface AuthResponse{
    token:string;
}