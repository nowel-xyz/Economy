import mongoose, { Document, Schema} from "mongoose";
import { IUserIP } from "../../types/IUser";
import { UserType } from "../user";

export interface IAuthentikUser extends Document {
    uid: string,
    email: string
    name: string
    ips: IUserIP[];
    __v: number
    type: string

    accessToken: string
    tokenType: string
    scope: string
    expiresIn: number
    idToken: string
}


const authentikUserSchema = new Schema({
    uid: { type: String, required: true, unique: true},
    email: { type: String, required: true, unique: true},
    name: { type: String, required: true},
    accessToken: { type: String, required: true },
    tokenType: { type: String, required: true },
    scope: { type: String, required: true },
    expiresIn: { type: Number, required: true },
    idToken: { type: String, required: true },
    ips: [
        {
            ip: { type: String, required: true },
            loginTimes: { type: Number, required: true, default: 1 },
            LastLogin: { type: Date, required: true, default: Date.now() },
        },
    ],
    type: { type: String, required: true, enum: Object.values(UserType), default: UserType.authentik },
},
{
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
    
})

export default mongoose.models.authentikUser || mongoose.model<IAuthentikUser>("authentikUser", authentikUserSchema)