import { IAuthentikUser } from "../schemas/oauth/authentik";
import { IUser } from "../schemas/user";

export default interface IAuth {
    global: IGlobalUser
    local: IUser | null 
    authentik: IAuthentikUser | null 
}




export interface IGlobalUser {
    uid: string
    email: string
    name: string
    lastName: string
    type: string
}