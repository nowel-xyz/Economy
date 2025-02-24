import {IUser} from "../schemas/user";
import { Request } from "express"

export default interface CustomRequest extends Request {
    user?: IUser
}