import { v4 as uuidv4 } from 'uuid';


export default async function unique_uuid(db: { exists: (arg0: { uid: string; }) => any; }) {
    let uid;
    let isTokenUnique = false;
    do {
        uid = uuidv4();
        const userWithToken = await db.exists({ uid });
        isTokenUnique = !userWithToken;
    } while (!isTokenUnique);
    return uid;
};