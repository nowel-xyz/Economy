import { Router, Express } from "express";
import Auth from "../../server/auth"; import authorize from "../utils/authorize";
import Tenant from "../../server/tenant";
import populateUser from "../utils/User/populateUser";
import User from "../../server/user";

const routerApi = Router()

export default class Routers {
    private app: Express
    routerApi: any;

    constructor(app: Express) {
        this.apiRouters()
        this.app = app
    }

    private apiRouters() {
        routerApi.use("/auth", new Auth().build());
        routerApi.use("/tenant", populateUser, new Tenant().build());
        routerApi.use("/users/@me", populateUser, new User().build());
    }

    public Build() {
        this.app.use("/api", routerApi)
    }
}