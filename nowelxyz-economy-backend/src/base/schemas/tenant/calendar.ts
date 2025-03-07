import mongoose, { Document, Schema} from "mongoose";

export interface Idays extends Document {
    day: string,
    time: Date,
    type: string,
    amount: number,
    by: string,
    from: string,
}


export interface IMonths extends Document {
    month: string,
    days: Idays[],
}


export interface IYear extends Document {
    year: string,
    months: IMonths[],
}


export interface ICalendar extends Document {
    tenantid: string,
    year: IYear[],
}

const calendarSchema = new Schema({
    tenantid: { type: String, required: true },
    year: [
        {
            year: { type: String, required: true },
            months: [
                {
                    month: { type: String, required: true },
                    days: [
                        {
                            day: { type: String, required: true },
                            time: { type: Date, required: true, default: Date.now() },
                            type: { type: String, required: true },
                            amount: { type: Number, required: true },
                            by: { type: String, required: true },
                            from: { type: String, required: true },
                        },
                    ],
                },
            ],
        },
    ],
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
    
})

export default mongoose.models.calendar || mongoose.model<ICalendar>("calendar", calendarSchema)