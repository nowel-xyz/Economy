import { Response, Router, Request } from "express";
import CustomRequest from "../../base/utils/CustomRequest";
import Tenantdb from "../../base/schemas/tenant";
import unique_uuid from "../../base/utils/unique_uuid";
import TenantMembers from "./members";
import TenantRoles from "./roles";
import Calendar from "./calendar";

export default class Tenant {
    public router: any;

    constructor() {
        this.router = Router()
        this.initializeRouters()
    }


    private initializeRouters() {
        this.router.post("/", this.newTenant)
        this.router.get("/:uid", this.getTenant)
        this.router.get("/:uid/", new Calendar().build())
        this.router.use("/members", new TenantMembers().build())
        this.router.use("/roles", new TenantRoles().build())
    }

    private async newTenant(req: CustomRequest, res: Response) {
        const { name } = req.body;
        if (!name) {
            return res.status(400).send({ message: "missing required inputs" });
        }

        let uid = await unique_uuid(Tenantdb);

        try {
            const tenant = await new Tenantdb(
                {
                    uid,
                    name,
                    members: { uid: req.user?.uid},
                    ownerid: req.user?.uid,
                    roles: []
                }).save();


            return res.status(200).send(tenant);
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: "Internal server error" });
        }
    }

    private async getTenant(req: CustomRequest, res: Response) {
        const { uid } = req.params;
        if (!uid) {
            return res.status(400).send({ message: "missing required inputs" });
        }

        try {
            const tenant = await Tenantdb.findOne({ $and: 
                [
                    { uid }, 
                    { members: { $elemMatch: { uid: req.user?.uid }}}
                ] 
            });


            if (!tenant) {
                return res.status(404).send({ message: "Tenant not found" });
            }

            return res.status(200).send(tenant);
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: "Internal server error" });
        }
    }

    public build() {
        return this.router;
    }
}
