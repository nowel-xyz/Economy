import { Response, Router, Request } from "express";
import axios from "axios";
import querystring from "querystring";
import dotenv from "dotenv";
import azureDb from "../../../base/schemas/oauth/azure";
import { UserType } from "../../../base/schemas/user";
import session from "../../../base/schemas/session";
import unique_uuid from "../../../base/utils/unique_uuid";
import EnvManager from "../../../base/utils/EnvManager";
import jwt from "jsonwebtoken"

dotenv.config();

export default class AuthAzure {
    public router: Router;
    private privateKey: string;

    constructor() {
        this.router = Router();
        this.initializeRouters();
        this.privateKey = EnvManager.get("SECRET_KEY");
    }
    
    private initializeRouters() {
        this.router.get("/login", this.login);
        this.router.get("/callback", this.callback.bind(this));
        this.router.get("/logout", this.logout);
    }

    private async login(req: Request, res: Response) {
        const fallbackURL = `${process.env.FRONTEND_URL}/`;
        const redirect_uri_raw = req.query.redirect_uri || fallbackURL;
    
        const redirect_uri =
            typeof redirect_uri_raw === 'string' && process.env.FRONTEND_URL && redirect_uri_raw.startsWith(process.env.FRONTEND_URL)
                ? redirect_uri_raw
                : fallbackURL;

        const authUrl = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/authorize`;
        const params = {
            client_id: process.env.AZURE_CLIENT_ID,
            response_type: "code",
            redirect_uri: process.env.AZURE_CALLBACK_URL,
            scope: "openid profile email User.Read",
            response_mode: "query",
            state: redirect_uri
        };
        res.redirect(`${authUrl}?${querystring.stringify(params)}`);
    }
    
    private async callback(req: Request, res: Response) {
        const { code, state } = req.query;

        if (!code) {
            return res.status(400).send("Missing authorization code");
        }

        try {
            const tokenUrl = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`;
            const tokenParams: any = {
                client_id: process.env.AZURE_CLIENT_ID,
                client_secret: process.env.AZURE_CLIENT_SECRET,
                code,
                redirect_uri: process.env.AZURE_CALLBACK_URL,
                grant_type: "authorization_code"
            };

            const response = await axios.post(tokenUrl, querystring.stringify(tokenParams), {
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });


            console.log(response.data)
            
            const userResponse = await axios.get("https://graph.microsoft.com/v1.0/me", {
                headers: { Authorization: `Bearer ${response.data.access_token}` }
            });
            
           

            const { data } = userResponse;
            const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            const existingUser = await azureDb.findOne({ uid: data.id });
            if(existingUser) {
                existingUser.email = data.mail;
                existingUser.name = data.givenName;
                existingUser.lastName = data.surname
                existingUser.accessToken = response.data.access_token;
                existingUser.tokenType = response.data.token_type;
                existingUser.scope = response.data.scope;
                existingUser.expiresIn = response.data.expires_in;
                existingUser.idToken = response.data.id_token;
                const existingIp = existingUser.ips.find((entry: { ip: string }) => entry.ip === ip);
                existingIp ? existingIp.loginTimes++ : existingUser.ips.push({ ip, loginTimes: 1, LastLogin: new Date() });
                await existingUser.save();
            } else {
                new azureDb({
                    uid: data.id,
                    email: data.mail,
                    name: data.givenName,
                    lastName: data.surname,
                    accessToken: response.data.access_token,
                    tokenType: response.data.token_type,
                    scope: response.data.scope,
                    expiresIn: response.data.expires_in,
                    idToken: response.data.id_token,
                    ips: [{ ip, loginTimes: 0, LastLogin: new Date() }],
                }).save();
            }

            
            let uid = await unique_uuid(session);


            const sessionToken = jwt.sign({ uid: data.id, email: data.mail }, this.privateKey as string);


            await session.create({
                uid,
                userid: data.id,
                ip,
                lastActive: Date.now(),
                cookie: sessionToken,
                type: UserType.azure,
            });

            res.cookie("sessionToken", sessionToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24,
            });

        //res.status(200).send({ message: "Login successfully", User: { email: data.mail } });
        if (typeof state === 'string') {
            res.redirect(state);
        } else {
            res.status(400).send('Invalid state parameter');
        }
        } catch (error) {
            console.error("OAuth callback error:", error);
            res.status(500).send("Error during authentication");
        }
    }
    
    private async logout(req: Request, res: Response) {
        res.redirect("https://login.microsoftonline.com/common/oauth2/v2.0/logout");
    }

    public build() {
        return this.router;
    }
}
