import { UserContextType, useUser } from "@/provider/User";
import { BACKEND_API } from "@/utils/urls";
import axios from "axios";
import router from "next/router";
import { useEffect, useState } from "react";

export default function Home() {
  const { user } = useUser() as UserContextType;
  const [tenants, setTenants] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false); // State to manage form visibility
  const [tenantName, setTenantName] = useState(""); // State for tenant name input

  useEffect(() => {
    const getTenants = async () => {
      try {
        const res = await axios.get(`${BACKEND_API}/users/@me/tenants`, { withCredentials: true });
        console.log(res.data);
        setTenants(res.data);
      } catch (err) { }
    };

    getTenants();
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${BACKEND_API}/tenant`,
        { name: tenantName },
        { withCredentials: true }
      );
      console.log("Tenant created:", res.data);
      setTenants((prev) => [...prev, res.data]); // Update the tenants list
      setShowForm(false); // Hide the form after successful submission
    } catch (err) {
      console.error("Error creating tenant:", err);
    }
  };

  return (
    <div>
      <h1>Home, {user?.name} {user?.lastName} {user?.email ? `email: ${user.email}` : ""}</h1>
      
      <h1>Tenants:</h1>
      {tenants.length === 0 ? 
        <h1>No tenants</h1> 
        : 
        tenants.map((tenant: any) => (
          <div key={tenant.uid} onClick={() => router.push(`/tenants/${tenant.uid}`)}>
            <h1>{tenant.name}</h1>
          </div>
        ))
      }

      {/* Button to toggle form visibility */}
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Create Tenant"}
      </button>

      {/* Form to create a tenant */}
      {showForm && (
        <form onSubmit={handleCreateTenant}>
          <input
            type="text"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            placeholder="Enter tenant name"
            required
          />
          <button type="submit">Create Tenant</button>
        </form>
      )}
    </div>
  );
}
