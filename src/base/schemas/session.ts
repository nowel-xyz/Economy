import mongoose, { Document, Schema} from "mongoose";
import { UserType } from "./user";

export interface ISession extends Document {
    uid: string,
    userid: string,
    ip: string,
    lastActive: Date,
    cookie: string,
    inactive: boolean
}

const SessionSchema = new Schema({
    uid: { type: String, required: true, unique: true},
    userid: { type: String, required: true },
    ip: { type: String, required: true },
    lastActive: { type: Date, required: true, default: Date.now() },
    cookie: { type: String, required: true, default: "null"},
    inactive: { type: Boolean, required: true, default: false},
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

export default mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema)