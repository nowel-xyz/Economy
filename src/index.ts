import app from "./base/app"
import {config} from "dotenv"
import EnvManager from "./base/utils/EnvManager";
config();

new app({
    port: 3000,
    mongooseURL: EnvManager.get("MONGOOSE_URL"),
}).init();

