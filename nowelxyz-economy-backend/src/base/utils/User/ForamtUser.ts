import { IUser } from "../../schemas/user";

export default function FormatUser(user: IUser): Partial<IUser> {

    const formattedUser: Partial<IUser> = (user as any).toJSON ? (user as any).toJSON() : JSON.parse(JSON.stringify(user));

    // Delete sensitive fields
    delete formattedUser.password;
    delete formattedUser.salt;
    delete formattedUser.ips;
    delete formattedUser.resetPasswordExpires;
    delete formattedUser.resetPasswordToken;
    delete formattedUser.deleteAccontExpires;
    delete formattedUser.deleteAccontToken;

    return formattedUser;
}
