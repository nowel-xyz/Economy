import { Response, Router, Request } from "express";
import CalendarYear from "../../../base/schemas/tenant/calendar";

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

  private async getCalendar(req: Request, res: Response) {
    const { uid, year } = req.params;
    // Find the calendar document for this tenant and year
    const calendarData = await CalendarYear.findOne({ tenantid: uid, year });
    if (!calendarData) {
      return res.status(404).json({ message: "No calendar data found for this year" });
    }
    res.status(200).json({ message: "Calendar data fetched successfully", data: calendarData });
  }

  private async newCalendarDay(req: Request, res: Response) {
    console.log("Processing new calendar day");

    const { uid, year, month, day } = req.params;
    let { time, type, amount, by, from } = req.body;

    // Convert "now" to a Date object if needed
    if (time === "now") {
      time = new Date();
    }

    if (!by) {
      return res.status(400).json({ message: "Field 'by' is required" });
    }

    // Look for an existing calendar document for the tenant and year
    let calendarYearDoc = await CalendarYear.findOne({ tenantid: uid, year });

    if (!calendarYearDoc) {
      // Create a new document if one doesn't exist
      calendarYearDoc = new CalendarYear({
        tenantid: uid,
        year,
        months: [{
          month,
          days: [{
            day,
            time,
            type,
            amount,
            by,
            from,
          }],
        }],
      });
    } else {
      // Look for the month in the document
      const monthIndex = calendarYearDoc.months.findIndex((m: any) => m.month === month);
      if (monthIndex === -1) {
        // Add new month with day
        calendarYearDoc.months.push({
          month,
          days: [{
            day,
            time,
            type,
            amount,
            by,
            from,
          }],
        });
      } else {
        // Month exists; append the new day
        calendarYearDoc.months[monthIndex].days.push({
          day,
          time,
          type,
          amount,
          by,
          from,
        });
      }
    }

    await calendarYearDoc.save();
    return res.status(200).json({ message: "Calendar data updated successfully", data: calendarYearDoc });
  }

  public build() {
    return this.router;
  }
}
