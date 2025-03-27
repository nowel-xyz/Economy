import mongoose, { Document, Schema } from "mongoose";

export interface ITenant extends Document {
    uid: string,
    name: string,
    members: IMembers[],
    roles: IRoles[],
    ownerid: string,
}

export interface IRoles extends Document {
    uid: string,
}

export interface IMembers extends Document {
    uid: string,
    role: IRoles
}


const TenantSchema = new Schema({
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    ownerid: { type: String, required: true },
    members: [{ 
        uid: { type: String, required: true }, 
        roles: [{
            uid: { type: String, required: false}
        }]
    }],
    roles: [{ 
        uid: { type: String, required: true }
    }]
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

export default mongoose.models.Tenant || mongoose.model<ITenant>("Tenant", TenantSchema)