import { Response, NextFunction } from "express";
import userSchema from "../../schemas/user";
import sessionSchema from "../../schemas/session";
import CustomRequest from "../CustomRequest";
import CheckCookie from "../CheckCookie";

export default async function populateUser(
    req: CustomRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    const cookie = CheckCookie(req);
    console.log("cookie", cookie);
    if (!cookie) {
        res.status(401).send({ message: "Unauthorized" });
        return;
    }

    try {
        const session = await sessionSchema.findOne({ cookie, inactive: false });
        if (!session) {
            res.status(401).send({ message: "Invalid session or session expired" });
            return;
        }

        console.log(session);
        const user = await userSchema.findOne({ uid: session.userid });
        console.log(user);
        if (!user) {
            res.status(404).send({ message: "Unauthorized" });
            return;
        }

        req.user = user;

        // Update session activity timestamp
        session.lastActive = new Date();
        await session.save();

        next();
    } catch (error) {
        res.status(500).send({ message: "Internal server error" });
    }
}
