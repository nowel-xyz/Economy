import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { connect } from "mongoose"
import Routers from "./Routers"

export default class CrateApp {
    
    private port: number
    private mongoooseURL: string

    constructor({port, mongoooseURL}: { port: number, mongoooseURL: string}) {  
        if(!mongoooseURL) throw new Error("Mongoose url must be provided")
        this.port = port
        this.mongoooseURL = mongoooseURL
    } 

    private App() {
        const app = express()

        app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true}))
        app.use(cookieParser());

        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        // "0.0.0.0",
        app.listen(this.port, "0.0.0.0", () => {
            console.log(`[Express] - Port ${this.port} is now active\n[Express] - http://localhost:${this.port}`)
        })
        
        return app
    }

    public init() {
        connect(this.mongoooseURL).then(() => {
            console.log(`[Database] - Connected`)
        }).catch((err) => { console.error(`[Database] - ${err}`)})

        const app = this.App();
        new Routers(app).Build();
    }
    
}