import mongoose, { Document, Schema} from "mongoose";
import { IUserIP } from "../types/IUser";

export interface IUser extends Document {
    uid: string,
    email: string
    name: string
    lastName: string
    password: string
    sessions: ISession[],
    salt: string,
    ips: IUserIP[];

    resetPasswordToken: string,
    resetPasswordExpires: Date
    deleteAccontToken: string,
    deleteAccontExpires: Date

}



export interface ISession extends Document {
    uid: string,
    cookie: string,
}

const UserSchema = new Schema({
    uid: { type: String, required: true, unique: true},
    email: { type: String, required: true, unique: true},
    name: { type: String, required: true},
    lastName: { type: String, required: true},
    password: { type: String, required: true},
    salt: { type: String, required: true, default: "null"},
    sessions: [
        {
            uid: { type: String, required: true },
            cookie: { type: String, required: true },
        },
    ],
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