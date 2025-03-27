export interface ISession {
    uid: string,
    userid: string,
    ip: string,
    lastActive: Date,
    cookie: string,
    inactive: boolean
}
