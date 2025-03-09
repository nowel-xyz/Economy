import { Router, Response, Express } from 'express';
import CustomRequest from '../../../base/utils/CustomRequest';
import axios from "axios";
import AuthentikUser from '../../../base/schemas/oauth/authentik';
import session from '../../../base/schemas/session';
import unique_uuid from '../../../base/utils/unique_uuid';
import jwt from 'jsonwebtoken';
import EnvManager from '../../../base/utils/EnvManager';
import User from '../../user';
import { UserType } from '../../../base/schemas/user';

export default class Authentik {
    public router: any
    clientID: string | undefined;
    clientSecret: string | undefined;
    redirectURI: string | undefined;
    authorizationURL: string;
    tokenURL: string;
    jwtSecret: string;
    transporter: any;
    privateKey: any;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
        this.privateKey = EnvManager.get("SECRET_KEY");
        this.jwtSecret = process.env.JWT_SECRET || ""
        this.clientID = process.env.AUTHENTIK_CLIENT_ID;
        this.clientSecret = process.env.AUTHENTIK_CLIENT_SECRET;
        this.redirectURI = process.env.AUTHENTIK_CALLBACK_URL;
        this.authorizationURL = `${process.env.AUTHENTIK_BASE_URL}/application/o/authorize/`;
        this.tokenURL = `${process.env.AUTHENTIK_BASE_URL}/application/o/token/`
    }

    private initializeRoutes() {
        this.router.get('/login', this.login);
        this.router.get('/callback', this.callback.bind(this));
        this.router.get('/logout', this.logout);
    }



    private login = async (req: CustomRequest, res: Response) => {
        res.redirect(`${this.authorizationURL}?response_type=code&client_id=${this.clientID}&redirect_uri=${this.redirectURI}&scope=openid profile email`);
    }

    private callback = async (req: CustomRequest, res: Response) => { 
        const { code } = req.query;
    
        if (!code || typeof code !== 'string') {
            return res.status(400).send('Authorization code not provided or invalid');
        }
    
        try {
            const params = new URLSearchParams();
            params.append('client_id', this.clientID || '');
            params.append('client_secret', this.clientSecret || '');
            params.append('redirect_uri', this.redirectURI || '');
            params.append('grant_type', 'authorization_code');
            params.append('code', code);
    
            const response = await axios.post(this.tokenURL, params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });
            
        const { access_token, expires_in } = response.data;
    
        const userInfo = await axios.get(`${process.env.AUTHENTIK_BASE_URL}/application/o/userinfo/`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            }
        });

        const { data } = userInfo;
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;


        const existingUser = await AuthentikUser.findOne({ uid: data.sub });
        if(existingUser) {
            existingUser.accessToken = access_token;
            existingUser.tokenType = response.data.token_type;
            existingUser.scope = response.data.scope;
            existingUser.expiresIn = expires_in;
            existingUser.idToken = data.sub;
            existingUser.email = data.email;
            existingUser.name = data.name;
            const existingIp = existingUser.ips.find((entry: { ip: string }) => entry.ip === ip);
            existingIp ? existingIp.loginTimes++ : existingUser.ips.push({ ip, loginTimes: 1, LastLogin: new Date() });
            await existingUser.save();
        } else {
            new AuthentikUser({
                uid: data.sub,
                email: data.email,
                name: data.name,
                accessToken: access_token,
                tokenType: response.data.token_type,
                scope: response.data.scope,
                expiresIn: expires_in,
                idToken: data.sub,
                ips: [{ ip, loginTimes: 0, LastLogin: new Date() }],
            }).save();
        }

        
        let uid = await unique_uuid(session);


        const sessionToken = jwt.sign({ uid: data.sub, email: data.email }, this.privateKey as string);


        await session.create({
            uid,
            userid: data.sub,
            ip,
            lastActive: Date.now(),
            cookie: sessionToken,
            type: UserType.authentik,
        });

        res.cookie("sessionToken", sessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24,
        });

        
        res.status(200).send({ message: "Login successfully", User: { email: data.email } });
        } catch (error: any) {
            console.error('Error exchanging code for token:', error.response ? error.response.data : error.message);
            res.status(500).send('Error during token exchange');
        }
    }

    private logout = async (req: CustomRequest, res: Response) => {
        res.clearCookie('localSessionToken');
        res.send("Logged out successfully");
    }

    public build() {
        return this.router;
    }
}
