import app from "./base/app"
import {config} from "dotenv"
import EnvManager from "./base/utils/EnvManager";
config();

console.log(EnvManager.get("TOKEN"))

new app({
    port: 3001,
    mongoooseURL: EnvManager.get("MONGOOSE_URL"),
}).init();

//process.env.MONGOOSE_URL ?? "mongodb://localhost:27017/data"