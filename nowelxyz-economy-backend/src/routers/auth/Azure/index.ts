import { Response, Router, Request } from "express";
import axios from "axios";
import querystring from "querystring";
import dotenv from "dotenv";

dotenv.config();

export default class AuthAzure {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRouters();
    }
    
    private initializeRouters() {
        this.router.get("/login", this.login);
        this.router.get("/callback", this.callback);
        this.router.get("/logout", this.logout);
    }

    private async login(req: Request, res: Response) {
        const authUrl = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/authorize`;
        const params = {
            client_id: process.env.AZURE_CLIENT_ID,
            response_type: "code",
            redirect_uri: process.env.AZURE_CALLBACK_URL,
            scope: "openid profile email User.Read",
            response_mode: "query"
        };
        res.redirect(`${authUrl}?${querystring.stringify(params)}`);
    }
    
    private async callback(req: Request, res: Response) {
        const { code } = req.query;

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
            // const { access_token } = response.data;
            
            const userResponse = await axios.get("https://graph.microsoft.com/v1.0/me", {
                headers: { Authorization: `Bearer ${response.data.access_token}` }
            });
            
            const user = userResponse.data;
            res.json({ message: "Login successful", user });
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
