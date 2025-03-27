import { Request } from "express"
import IAuth from "../types/IAuth";

export default interface CustomRequest extends Request {
    user?: IAuth
}