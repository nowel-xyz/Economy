import mongoose, { Document, Schema} from "mongoose";


export interface ITenantRole extends Document {
    uid: string,
    tenantid: string,
    name: string,
    ownerid: string,
    members: string[],
    permissions: IPermissions,
}

export interface IPermissions extends Document {
    write: boolean,
    read: boolean,
    delete: boolean,
    users: boolean,
    roles: boolean,
    tenant: boolean,
}


const TenantRoleSchema = new Schema({
    uid: { type: String, required: true, unique: true},
    tenantid: { type: String, required: true},
    name: { type: String, required: true},
    ownerid: { type: String, required: true},
    members: [{ type: String, required: true }],
    permissions: {
        write: { type: Boolean, required: true, default: false},
        read: { type: Boolean, required: true, default: false},
        delete: { type: Boolean, required: true, default: false},
        users: { type: Boolean, required: true, default: false},
        roles: { type: Boolean, required: true, default: false},
        tenant: { type: Boolean, required: true, default: false},
    }
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

export default mongoose.models.TenantRole || mongoose.model<ITenantRole>("TenantRole", TenantRoleSchema)