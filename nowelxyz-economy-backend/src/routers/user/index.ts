import { Response, Router } from "express";
import CustomRequest from "../../base/utils/CustomRequest";
import ForamtUser from "../../base/utils/User/ForamtUser";
import Tenantdb from "../../base/schemas/tenant";
import Sessiondb from "../../base/schemas/session";
import CheckCookie from "../../base/utils/CheckCookie";
export default class User {
    public router: any;

    constructor() {
        this.router = Router();
        this.initializeRouters();
    }

    private initializeRouters() {
        this.router.get("/", this.user);
        this.router.get("/tenants", this.getTenants);
        this.router.get("/session", this.getSession);
    }

    private async user(req: CustomRequest, res: Response) {
        console.log(req.user);
        if (!req.user) {
            return res.status(404).send({ message: "User not found" });
        }
        const user = ForamtUser(req.user);
        if(!user) {
            return res.status(404).send({ message: "User not found" });
        }

        return res.status(200).send({ message: `${user.name} ${user.lastName} user data`, data: user });
    }

    private async getTenants(req: CustomRequest, res: Response) {
       
        try {
            const tenants = await Tenantdb.find({
                $or: [
                    { ownerid: req.user?.global.uid },
                    { members: { $elemMatch: { uid: req.user?.global.uid } } }
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

    private async getSession(req: CustomRequest, res: Response) {
        console.log(req.user);
        const cookie = CheckCookie(req);
        
        const session = await Sessiondb.findOne({ userid: req.user?.global.uid, cookie, inactive: false });
        console.log(session);
        if(!session) {
            return res.status(404).send({ message: "session is inactive" });
        }

        return res.status(200).send({ message: "session is active", data: {user: {uid: session.userid}} });

    }

    public build() {
        return this.router;
    }
}

