import { Response, NextFunction } from "express";
import CustomRequest from "./CustomRequest";

export default function authorize(requiredRoles: string[]) {
    return (req: CustomRequest, res: Response, next: NextFunction): void => {
        const user = req.user;
        if (!user) {
            res.status(403).send({ message: "Access denied" });
            return;
        }
        next();
    };
}
