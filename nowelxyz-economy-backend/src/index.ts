import app from "./base/app"
import {config} from "dotenv"
config();
new app({
    port: 3001,
    mongoooseURL: process.env.MONGOOSE_URL ?? "mongodb://localhost:27017/data"
}).init();
