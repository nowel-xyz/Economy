import { UserContextType, useUser } from "@/provider/User";
import { BACKEND_API } from "@/utils/urls";
import axios from "axios";
import router from "next/router";
import { useEffect, useState } from "react";

export default function Home() {
  const { user } = useUser() as UserContextType;
  const [tenents, setTenents] = useState([]);


  useEffect(() => {
    const getTenants = async () => {
      try {
        const res = await axios.get(`${BACKEND_API}/users/@me/tenants`, { withCredentials: true });
        console.log(res.data);
        setTenents(res.data);
      } catch (err) { }
    };

    getTenants();
  }, []);


  return (
    <div>
      <h1>Home, {user?.name} {user?.lastName}</h1>
      
      <h1>Tenents:</h1>
      {tenents.length === 0 ? 
        <h1>No tenents</h1> 
        : 
        tenents.map((tenant: any) => (
          <div key={tenant.uid} onClick={() => router.push(`/tenants/${tenant.uid}`)}>
            <h1>{tenant.name}</h1>
          </div>
        ))
      }

    </div>
  );
}
