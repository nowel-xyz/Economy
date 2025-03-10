import { Response, Router, Request } from "express";
import calendardb from "../../../base/schemas/tenant/calendar";

export default class Calendar {
    public router: any;

    constructor() {
        this.router = Router({ mergeParams: true})
        this.initializeRouters()
    }


    private initializeRouters() {
        this.router.get("/:year", this.getCalendar)
        this.router.get("/:year/:month", this.getCalendar)
        this.router.get("/:year/:month/:day", this.getCalendar)
        this.router.post("/:year/:month/:day", this.newCalendarDay)
        
    }

    private async getCalendar(req: Request, res: Response) {
        const { uid, year, month, day } = req.params;
        const calendarData = await calendardb.findOne({  tenantid: uid, })
        res.status(200).json({ message: "Calendar data fetched successfully", data: calendarData })
    }

    private async newCalendarDay(req: Request, res: Response) {
        console.log("asdasdasdsads")
        const { uid, year, month, day } = req.params;
        const { time, type, amount, by, from } = req.body;
        const calendarData = await calendardb.findOne({  tenantid: uid, })
        if (!calendarData) {
            const newCalendar = new calendardb({
                tenantid: uid,
                year: [
                    {
                        year: year,
                        months: [
                            {
                                month: month,
                                days: [
                                    {
                                        day: day,
                                        time: time,
                                        type: type,
                                        amount: amount,
                                        by: by,
                                        from: from,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            })
            await newCalendar.save()
            res.status(200).json({ message: "Calendar data created successfully", data: newCalendar })
        } else {
            const newCalendar = await calendardb.findOneAndUpdate(
                { tenantid: uid, "year.year": year, "year.months.month": month, "year.months.days.day": day },
                {
                    $push: {
                        "year.$.months.$.days": {
                            day: day,
                            time: time,
                            type: type,
                            amount: amount,
                            by: by,
                            from: from,
                        },
                    },
                },
                { new: true }
            )
            res.status(200).json({ message: "Calendar data updated successfully", data: newCalendar })
        }
    }

   

    public build() {
        return this.router;
    }
}
