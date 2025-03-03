import { Response, Router } from "express";
import CustomRequest from "../../base/utils/CustomRequest";
import ForamtUser from "../../base/utils/User/ForamtUser";
import Tenantdb from "../../base/schemas/tenant";
export default class User {
    public router: any;

    constructor() {
        this.router = Router();
        this.initializeRouters();
    }

    private initializeRouters() {
        this.router.get("/", this.user);
        this.router.get("/tenants", this.getTenants);
    }

    private async user(req: CustomRequest, res: Response) {
        if (!req.user) {
            return res.status(404).send({ message: "Unauthorized" });
        }
        const user = ForamtUser(req.user);
        return res.status(200).send({ message: `${user.name} ${user.lastName} user data`, data: user });
    }

    private async getTenants(req: CustomRequest, res: Response) {
        console.log(req.user);
        try {
            const tenants = await Tenantdb.find({
                $or: [
                    { ownerid: req.user?.uid },
                    { members: { $elemMatch: { uid: req.user?.uid } } }
                ]
            });
            

            if (!tenants.length) {
                return res.status(404).json({ message: "No tenants found" });
            }

            res.json(tenants);
        } catch (error) {
            console.error("Error fetching tenants:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    public build() {
        return this.router;
    }
}

