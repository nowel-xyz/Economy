import { Response, Router, Request } from "express";
import User from "../../base/schemas/user"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import session from "../../base/schemas/session";
import CheckCookie from "../../base/utils/CheckCookie";
import unique_uuid from "../../base/utils/unique_uuid";
import MailManger from "../../base/utils/Mail";
import populateUser from "../../base/utils/User/populateUser";
import EnvManager from "../../base/utils/EnvManager";
import AuthAzure from "./Azure";


export default class Auth {
    public router: any;
    private privateKey: string | undefined;

    constructor() {
        this.router = Router()
        this.initializeRouters()
        this.privateKey = EnvManager.get("SECRET_KEY");
    }
    
    private initializeRouters() {
        this.router.post("/login", this.login.bind(this))
        this.router.get("/logout", populateUser, this.logout.bind(this))
        this.router.post("/register", this.register.bind(this))
        this.router.use("/azure", new AuthAzure().build())
    }

    private async login(req: Request, res: Response) {
        const { email, password } = req.body;
        const Userdata = await User.findOne({ email });
        if (!Userdata) return res.status(400).send({ message: 'Unauthorized' });

        const checkPassword = await bcrypt.compare(password, Userdata.password);
        if (!checkPassword) return res.status(400).send({ message: 'Unauthorized' });

        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const existingIp = Userdata.ips.find((entry: { ip: string }) => entry.ip === ip);

        let subject;
        let text
        if (existingIp) {
            // IP found in the list, update login times
            existingIp.loginTimes += 1;
            existingIp.LastLogin = Date.now()
            subject = "New login from recognized IP";
            text = `A new login to your account has occurred from an IP we recognize. If this wasn't you, please change your password immediately.`;
        } else {
            // New IP detected
            subject = "New login from unrecognized IP";
            text = `A new login attempt was made from a new IP address: ${ip}. If this wasn't you, please change your password immediately.`;
            Userdata.ips.push({ ip, loginTimes: 1, LastLogin: Date.now() });
        }


        let uid = await unique_uuid(User);


        const sessionToken = jwt.sign({ uid: Userdata.uid, email }, this.privateKey as string);



        const NewSession = await session.create({
            uid,
            userid: Userdata.uid,
            ip,
            lastActive: Date.now(),
            cookie: sessionToken,
        });

        Userdata.cookie = sessionToken;
        Userdata.markModified('ips');
        await Userdata.save();


        res.cookie("sessionToken", sessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24,
        });

        res.status(200).send({ message: "Login successfully", User: { username: Userdata.username } });


        new MailManger().sendMail(Userdata.email, subject, text);
    }

    private async logout(req: Request, res: Response) {
        res.clearCookie("sessionToken")
        const cookie = CheckCookie(req)
        const sessiondDB = await session.findOne({ cookie })
        if (sessiondDB) {
            sessiondDB.inactive = true;
            await sessiondDB.save();
        }
        return res.redirect(`${EnvManager.get("FRONTEND")}/`)
    }

    private async register(req: Request, res: Response) {
        const { name, lastName, password, email } = req.body;
        if (!name || !lastName || !password || !email) return res.status(400).send({ message: "Bad request" });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).send({ message: "Email is taken" });


        let uid = await unique_uuid(User);


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        const user = await new User({
            uid,
            name,
            lastName,
            salt,
            password: hashedPassword,
            ips: [{ ip, loginTimes: 0, }],
            email,
        }).save();

        const userObject = user.toObject();
        delete userObject.salt;
        delete userObject.cookie;
        delete userObject.password;
        delete userObject.ips;

        res.send({ message: "New user was created", data: { user: userObject } });


        // TODO: get mail content form database
        const subject = "New account created";
        const text = `Hi ${name} ${lastName},\n\nWelcome to ${EnvManager.get("DOMAIN_NAME")}\n\nWe are excited to have you on board!`;
        new MailManger().sendMail(userObject.email, subject, text);
    }

    public build() {
        return this.router;
    }
}
