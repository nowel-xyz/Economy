import CustomRequest from "./CustomRequest";

export default function CheckCookie(req: CustomRequest) {
    const sessionToken = req.cookies.sessionToken || 
    req.headers.cookie?.split("; ")
    .find((cookie: string) => cookie.startsWith("sessionToken="))
    ?.replace("sessionToken=", "")
    return sessionToken;
}