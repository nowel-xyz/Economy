import mongoose, { Document, Schema} from "mongoose";
import { IUserIP } from "../types/IUser";

export interface IUser extends Document {
    uid: string,
    email: string
    name: string
    lastName: string
    password: string
    salt: string,
    ips: IUserIP[];

    resetPasswordToken: string,
    resetPasswordExpires: Date
    deleteAccontToken: string,
    deleteAccontExpires: Date
    __v: number
    type: string
}


export enum UserType {
    local = "local",
    azure = "azure",
    authentik = "authentik",
}



const UserSchema = new Schema({
    uid: { type: String, required: true, unique: true},
    email: { type: String, required: true, unique: true},
    name: { type: String, required: true},
    lastName: { type: String, required: true},
    password: { type: String, required: true},
    salt: { type: String, required: true, default: "null"},
    ips: [
        {
            ip: { type: String, required: true },
            loginTimes: { type: Number, required: true, default: 1 },
            LastLogin: { type: Date, required: true, default: Date.now() },
        },
    ],
    resetPasswordToken: { type: String, required: false, default: "null"},
    resetPasswordExpires: { type: Date, required: false},
    deleteAccontToken: { type: String, required: false, default: "null"},
    deleteAccontExpires: { type: Date, required: false},
    type: { type: String, required: true, enum: Object.values(UserType), default: UserType.local },
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

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)