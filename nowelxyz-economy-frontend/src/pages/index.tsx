import { UserContextType, useUser } from "@/provider/User";

export default function Home() {
  const { user, userloading } = useUser() as UserContextType;

  return (
    <div>
      <h1>Home, {user?.name} {user?.lastName}</h1>
    </div>
  );
}
