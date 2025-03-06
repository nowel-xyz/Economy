export default class EnvManager {
    private static NeedTobeDefiend: { [key: string]: string } = {
        MONGOOSE_URL: "MONGOOSE_URL",
        SECRET_KEY: "SECRET_KEY",
        FRONTEND_URL: "FRONTEND_URL",
        DOMAIN_NAME: "DOMAIN_NAME",
        JWT_SECRET_KEY: "JWT_SECRET_KEY",
        MAIL_HOST: "MAIL_HOST",
        MAIL_USER: "MAIL_USER",
        MAIL_PASSWORD: "MAIL_PASSWORD",
    }

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

    static checkDefiendEnvs(): void {
        let i = [];
        for (const key in this.NeedTobeDefiend) {
            if (!process.env[key]) {
                i.push(key);
            }
        }

        if(i.length > 0) {
            throw new Error(`The following envs are not defined: ${i.join(", ")}`);
        }
    }

}
