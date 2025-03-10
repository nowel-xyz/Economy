import { Response, NextFunction } from "express";
import userSchema, { UserType } from "../../schemas/user";
import sessionSchema from "../../schemas/session";
import CustomRequest from "../CustomRequest";
import CheckCookie from "../CheckCookie";
import authentik from "../../schemas/oauth/authentik";
import { IGlobalUser } from "../../types/IAuth";
import azure from "../../schemas/oauth/azure";

export default async function populateUser(
    req: CustomRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    const cookie = CheckCookie(req);
    console.log(cookie);
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
        let globalUserdata: IGlobalUser;
        
        switch (session.type) {
            case UserType.local:
                const user = await userSchema.findOne({ uid: session.userid });
                if (!user) {
                    res.status(404).send({ message: "Unauthorized" });
                    return;
                }

                globalUserdata = {
                    uid: user.uid,
                    email: user.email,
                    name: user.name,
                    lastName: user.lastName,
                    type: UserType.local
                }

                req.user = {
                    global: globalUserdata,
                    authentik: null,
                    local: user,
                    azurekUser: null
                }
                break;
            case UserType.authentik:
                const authentikUser = await authentik.findOne({ uid: session.userid });
                if (!authentikUser) {
                    res.status(404).send({ message: "Unauthorized" });
                    return;
                }

                globalUserdata = {
                    uid: authentikUser.uid,
                    email: authentikUser.email,
                    name: authentikUser.name,
                    lastName: authentikUser.lastName,
                    type: UserType.authentik
                }

                req.user = {
                    global: globalUserdata,
                    authentik: authentikUser,
                    local: null,
                    azurekUser: null
                }
                break;
            case UserType.azure: 
            const azurekUser = await azure.findOne({ uid: session.userid });
            if (!azurekUser) {
                res.status(404).send({ message: "Unauthorized" });
                return;
            }

            globalUserdata = {
                uid: azurekUser.uid,
                email: azurekUser.email,
                name: azurekUser.name,
                lastName: azurekUser.lastName,
                type: UserType.azure
            }

            req.user = {
                global: globalUserdata,
                authentik: null,
                local: null,
                azurekUser: azurekUser
            }
            break;
            default:
                res.status(500).send({ message: "Internal server error" });
                return;
        }

        session.lastActive = new Date();
        await session.save();

        next();
    } catch (error) {
        res.status(500).send({ message: "Internal server error" });
    }
}
