import { Response, Router } from "express";
import CustomRequest from "../../base/utils/CustomRequest";
import IUser from "../../base/types/IUser";
import ForamtUser from "../../base/utils/User/ForamtUser";

export default class User {
    public router: any;

    constructor() {
        this.router = Router();
        this.initializeRouters();
    }

    private initializeRouters() {
        this.router.get("/", this.user);
    }

    private async user(req: CustomRequest, res: Response) {
        if (!req.user) {
            return res.status(404).send({ message: "Unauthorized" });
        }
        const user = ForamtUser(req.user);
        return res.status(200).send(user);
    }

    public build() {
        return this.router;
    }
}

