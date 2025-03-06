import { Response, Router, Request } from "express";

export default class Calendar {
    public router: any;

    constructor() {
        this.router = Router()
        this.initializeRouters()
    }


    private initializeRouters() {
        this.router.get("/:year", this.getCalendar)
        this.router.get("/:year/:month", this.getCalendar)
        this.router.get("/:year/:month/:day", this.getCalendar)

    }

    private async getCalendar(req: Request, res: Response) {
        const { year, month, day } = req.params;
       
    }

   

    public build() {
        return this.router;
    }
}
