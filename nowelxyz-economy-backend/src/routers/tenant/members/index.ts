import { Response, Router, Request } from "express";
import CustomRequest from "../../../base/utils/CustomRequest";
import Tenantdb from "../../../base/schemas/tenant";

export default class TenantMembers {
    public router: any;

    constructor() {
        this.router = Router({ mergeParams: true })
        this.initializeRouters()
    }


    private initializeRouters() {
        this.router.get("/", this.tenantMembers)
        this.router.post("/", this.tenantNewMember)
        this.router.delete("/", this.tenantRemoveMember)

    }


    private async tenantNewMember(req: CustomRequest, res: Response) {
        const { tenantuid, memberuid } = req.body;
        if (!tenantuid || !memberuid) {
            return res.status(400).send({ message: "missing required inputs" });
        }

        try {
            const tenant = await Tenantdb.findOne({ uid: tenantuid });
            if (!tenant) {
                return res.status(404).send({ message: "Tenant not found" });
            }


            //TODO check perms of roles
            if (tenant.ownerid !== req.user?.global.uid) {
                return res.status(403).send({ message: "You are not the owner of this tenant" });
            }

            if (tenant.members.includes(memberuid)) {
                return res.status(400).send({ message: "User already a member of this tenant" });
            }

            tenant.members.push(memberuid);
            await tenant.save();

            return res.status(200).send(tenant);
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: "Internal server error" });
        }
    }

    private async tenantMembers(req: CustomRequest, res: Response) {
        const { uid } = req.params;
        console.log(uid)
        if (!uid) {
            return res.status(400).send({ message: "missing required inputs" });
        }


        try {
            const tenant = await Tenantdb.findOne({ uid });
            if (!tenant) {
                return res.status(404).send({ message: "Tenant not found" });
            }

            if (!tenant.members.includes(req.user?.global.uid)) {
                return res.status(403).send({ message: "You are not a member of this tenant" });
            }

            return res.status(200).send({ message: "Members of the tenant", data: { members: tenant.members } });
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: "Internal server error" });
        }
    }

    private async tenantRemoveMember(req: CustomRequest, res: Response) {
        const { tenantuid, memberuid } = req.body;

        if (!tenantuid || !memberuid) {
            return res.status(400).json({ message: "Missing required inputs" });
        }

        try {
            const tenant = await Tenantdb.findOne({ uid: tenantuid });

            if (!tenant) {
                return res.status(404).json({ message: "Tenant not found" });
            }

            const isOwner = tenant.ownerid === req.user?.global.uid;
            const isSelfRemoval = memberuid === req.user?.global.uid;

            if (!isOwner && !isSelfRemoval) {
                return res.status(403).json({ message: "You do not have permission to remove this member" });
            }

            if (memberuid === tenant.ownerid) {
                return res.status(403).json({ message: "Owner cannot be removed" });
            }

            await Tenantdb.updateOne(
                { uid: tenantuid },
                { $pull: { members: memberuid } }
            );

            return res.status(200).json({ message: "Member removed successfully" });
        } catch (error) {
            console.error("Error removing member:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }



    public build() {
        return this.router;
    }
}
