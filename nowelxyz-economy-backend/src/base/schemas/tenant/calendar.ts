import mongoose, { Document, Schema } from "mongoose";

export interface IDay extends Document {
  day: string;
  time: Date;
  type: string;
  amount: number;
  by: string;
  from: string;
}

export interface IMonth extends Document {
  month: string;
  days: IDay[];
}

export interface ICalendarYear extends Document {
  tenantid: string;
  year: string;
  months: IMonth[];
}


const dayActive = new Schema({
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    time: { type: Date, required: true },
    lastUpdated: { type: Date, required: true },
});

const daySchema = new Schema({
  day: { type: String, required: true },
  active: { type: [dayActive], required: true },
});

const monthSchema = new Schema({
  month: { type: String, required: true },
  days: [daySchema],
});

const calendarYearSchema = new Schema(
  {
    tenantid: { type: String, required: true },
    year: { type: String, required: true },
    months: [monthSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default mongoose.models.CalendarYear || mongoose.model<ICalendarYear>("CalendarYear", calendarYearSchema);
