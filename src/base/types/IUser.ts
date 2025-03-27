export default interface IUser {
    uid: string,
    email: string
    name: string
    lastName: string
    password: string | undefined,
    sessions: IUserSession[] | undefined,
    salt: string | undefined,
    ips: IUserIP[] | undefined,

    resetPasswordToken: string | undefined,
    resetPasswordExpires: Date | undefined,
    deleteAccontToken: string | undefined,
    deleteAccontExpires: Date | undefined,
}


export interface IUserIP {
    ip: string;
    loginTimes: number;
}

export interface IUserSession {
    uid: string,
    cookie: string,
}