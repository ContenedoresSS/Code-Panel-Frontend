
const ACCES_TOKEN = 'accesToken';
const REFRESH_TOKEN = 'refreshToken';

export const TokenService = {

    getAccesToken :() :string | null =>{
        return localStorage.getItem(ACCES_TOKEN);
    },
    getRefreshToken :() :string | null =>{
        return localStorage.getItem(REFRESH_TOKEN);
    },

    setTokens :(accesToken:string, refreshToken:string) : void =>{
        localStorage.setItem(ACCES_TOKEN, accesToken);
        localStorage.setItem(REFRESH_TOKEN, refreshToken);
    },

    removeTokens :() : void =>{
        localStorage.removeItem(ACCES_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
    }

}