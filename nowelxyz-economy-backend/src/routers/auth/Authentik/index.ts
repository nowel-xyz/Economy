import { Router, Response, Express } from 'express';
import CustomRequest from '../../../base/utils/CustomRequest';
import axios from "axios";

export default class Authentik {
    public router: any
    clientID: string | undefined;
    clientSecret: string | undefined;
    redirectURI: string | undefined;
    authorizationURL: string;
    tokenURL: string;
    jwtSecret: string;
    transporter: any;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
        this.jwtSecret = process.env.JWT_SECRET || ""
        this.clientID = process.env.AUTHENTI_LOCAL_CLIENT_ID;
        this.clientSecret = process.env.AUTHENTI_LOCAL_CLIENT_SECRET;
        this.redirectURI = process.env.AUTHENTI_LOCAL_CALLBACK_URL;
        this.authorizationURL = `${process.env.AUTHENTI_LOCAL_BASE_URL}/application/o/authorize/`;
        this.tokenURL = `${process.env.AUTHENTI_LOCAL_BASE_URL}/application/o/token/`
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
    
            const userInfo = await axios.get(`${process.env.AUTHENTI_LOCAL_BASE_URL}/application/o/userinfo/`, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                }
            });
    
            const { data } = userInfo;

            res.send({ user: data });

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
