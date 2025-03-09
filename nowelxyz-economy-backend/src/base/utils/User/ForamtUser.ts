import IAuth, { IGlobalUser } from "../../types/IAuth";

export default function FormatUserData(Auth: IAuth): IGlobalUser | null {
    // Ensure we have a plain object
    const formattedUser: Partial<IAuth> = (Auth as any).toJSON 
        ? (Auth as any).toJSON() 
        : JSON.parse(JSON.stringify(Auth));


    if (formattedUser.global) {
        const localGlobalUser: IGlobalUser = {
            uid: formattedUser.global.uid,
            email: formattedUser.global.email,
            name: formattedUser.global.name,
            lastName: formattedUser.global.lastName,
            type: formattedUser.global.type
        };
        return localGlobalUser
    }

    return null
}
