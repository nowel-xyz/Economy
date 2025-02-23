import User from "../../types/IUser";

export default function FormatUser(user: User): Partial<User> {

    const formattedUser: Partial<User> = (user as any).toObject ? (user as any).toObject() : JSON.parse(JSON.stringify(user));

    // Delete sensitive fields
    delete formattedUser.password;
    delete formattedUser.sessions;
    delete formattedUser.salt;
    delete formattedUser.ips;
    delete formattedUser.resetPasswordExpires;
    delete formattedUser.resetPasswordToken;
    delete formattedUser.deleteAccontExpires;
    delete formattedUser.deleteAccontToken;

    return formattedUser;
}
