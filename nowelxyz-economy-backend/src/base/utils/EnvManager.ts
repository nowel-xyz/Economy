import { config } from "dotenv";
config(); 

export default class EnvManager {
    private static defaults: Record<string, string> = {
        TOKEN: "default-token",
        API_URL: "https://example.com",
        DEBUG_MODE: "false"
    };


    static get(key: string): string {
        return process.env[key] ?? this.defaults[key] ?? "";
    }

    static set(key: string, value: string): void {
        process.env[key] = value;
    }

}
