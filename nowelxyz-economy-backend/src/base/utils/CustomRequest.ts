import IUser from "../types/IUser";
import { Request } from "express"

export default interface CustomRequest extends Request {
    user?: IUser
}