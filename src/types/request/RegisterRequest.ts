export interface RegisterDTO{
    name: string;
    lastName:string;
    email:string;
    password:string;
    identifier: string;
    invitationCode?: string;
}