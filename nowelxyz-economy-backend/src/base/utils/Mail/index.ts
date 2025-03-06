import nodemailer from "nodemailer"
import EnvManager from "../EnvManager";

export default class MailManger {
    private transporter: any;

    constructor() {
    this.transporter = nodemailer.createTransport({
            host:  EnvManager.get("MAIL_HOST"),
            auth: {
                user:  EnvManager.get("MAIL_USER"),
                pass:  EnvManager.get("MAIL_PASSWORD"),
            },

        });
    }

    public async sendMail(email: string, subject: string, text: string) {
        const mailOptions = {
            from: EnvManager.get("MAIL_USER"),
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


