import { Response, Router, Request } from "express";
import CustomRequest from "../../../base/utils/CustomRequest";
import TenantRoleDB from "../../../base/schemas/tenant/roles";
import TenantDB from "../../../base/schemas/tenant";
import unique_uuid from "../../../base/utils/unique_uuid";

export default class TenantRoles {
    public router: any;

    constructor() {
        this.router = Router()
        this.initializeRouters()
    }


    private initializeRouters() {
        this.router.get("/", this.tenantRoles)
        this.router.post("/", this.newTenantRoles)
        this.router.delete("/", this.deleteTenantRoles)
    }


    private async tenantRoles(req: CustomRequest, res: Response) {
      
    }

    private async newTenantRoles(req: CustomRequest, res: Response) {
        const { name, permission, tenantuid, ownerid, members } = req.body;
    
        if (!name || !permission || !tenantuid || !ownerid) {
            return res.status(400).json({ message: "Missing required fields" });
        }
    
        const validPermissions = {
            write: permission.write ?? false,
            read: permission.read ?? false,
            delete: permission.delete ?? false,
            users: permission.users ?? false,
            roles: permission.roles ?? false,
            tenant: permission.tenant ?? false,
        };
    
        try {
            const roleUID = unique_uuid(TenantRoleDB);
            const newRole = new TenantRoleDB({
                uid: roleUID,
                tenantid: tenantuid,
                name,
                ownerid,
                members: members || [],
                permissions: validPermissions,
            });
    
            await newRole.save();
    
            await TenantDB.findOneAndUpdate(
                { uid: tenantuid },
                { $push: { roles: { uid: roleUID } } },
                { new: true }
            );
    
            res.status(201).json({ message: "Role created successfully", role: newRole });
        } catch (error) {
            res.status(500).json({ message: "Error creating role", error });
        }
    }

    private async deleteTenantRoles(req: CustomRequest, res: Response) {
      
    }

    public build() {
        return this.router;
    }
}
