import { IAuthentikUser } from "../schemas/oauth/authentik";
import { IUser } from "../schemas/user";

export default interface IAuth {
    global: IGlobalUser
    local: IUser | null | ILocalUser
    authentik: IAuthentikUser | null | ILocalAuthentikUser
}



export interface ILocalUser {
    uid: string,
    email: string
    name: string
    lastName: string
    __v: number
    type: string
} 


export interface ILocalAuthentikUser {
    uid: string,
    email: string
    name: string
    __v: number
    type: string
} 

export interface IGlobalUser {
    uid: string
    email: string
    name: string
    lastName: string
    type: string
}