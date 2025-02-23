import nodemailer from "nodemailer"

export default class MailManger {
    private transporter: any;

    constructor() {
    this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            },

        });
    }

    public async sendMail(email: string, subject: string, text: string) {
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject,
            text,
        };

        try {
            //await this.transporter.sendMail(mailOptions);
        } catch (error: any) {
            console.error("Error sending email:", error);
        }
    }
}


