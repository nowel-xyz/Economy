import { Response, Router, Request } from "express";
import CalendarYear from "../../../base/schemas/tenant/calendar"; // This file now exports the updated CalendarYear model
import CustomRequest from "../../../base/utils/CustomRequest";

export default class Calendar {
  public router: any;

  constructor() {
    this.router = Router({ mergeParams: true });
    this.initializeRouters();
  }

  private initializeRouters() {
    this.router.get("/:year", this.getCalendar);
    this.router.get("/:year/:month", this.getCalendar);
    this.router.get("/:year/:month/:day", this.getCalendar);
    this.router.post("/:year/:month/:day", this.newCalendarDay);
  }

  private async getCalendar(req: CustomRequest, res: Response) {
    const { uid, year } = req.params;
    // Find the calendar document for this tenant and year
    const calendarData = await CalendarYear.findOne({ tenantid: uid, year });
    if (!calendarData) {
      return res.status(404).json({ message: "No calendar data found for this year" });
    }
    res.status(200).json({ message: "Calendar data fetched successfully", data: calendarData });
  }

  private async newCalendarDay(req: CustomRequest, res: Response) {
    console.log("Processing new calendar day");

    const { uid, year, month, day } = req.params;
    let { type, amount, from } = req.body;



    // Validate required fields
    if (!from || !type || !amount) {
      return res.status(400).json({ message: "Missing required fields: by, from, type, amount" });
    }

    // Create a new active record based on the updated schema
    const newActiveRecord = {
      userId: req.user?.global.uid,
      amount: Number(amount),
      type: type,
      description: from,
      time: new Date(),
      lastUpdated: new Date()
    };

    // Look for an existing calendar document for the tenant and year
    let calendarYearDoc = await CalendarYear.findOne({ tenantid: uid, year });

    if (!calendarYearDoc) {
      // Create a new document if none exists
      calendarYearDoc = new CalendarYear({
        tenantid: uid,
        year,
        months: [{
          month,
          days: [{
            day,
            active: [newActiveRecord]
          }]
        }]
      });
    } else {
      // Find the month document within the year
      let monthDoc = calendarYearDoc.months.find((m: any) => m.month === month);
      if (!monthDoc) {
        // Add a new month with a new day entry if month does not exist
        calendarYearDoc.months.push({
          month,
          days: [{
            day,
            active: [newActiveRecord]
          }]
        });
      } else {
        // Check if the day document already exists within the month
        let dayDoc = monthDoc.days.find((d: any) => d.day === day);
        if (!dayDoc) {
          // Add a new day document with the active record
          monthDoc.days.push({
            day,
            active: [newActiveRecord]
          });
        } else {
          // Day document exists; push the new active record into the active array
          dayDoc.active.push(newActiveRecord);
        }
      }
    }

    await calendarYearDoc.save();
    return res.status(200).json({ message: "Calendar data updated successfully", data: calendarYearDoc });
  }

  public build() {
    return this.router;
  }
}
