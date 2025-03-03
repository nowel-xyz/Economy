import { useRouter } from "next/router";

export default function TenantPage() {
  const router = useRouter();
  const { tenantid } = router.query;

  if (!tenantid) return <p>Loading...</p>;

  return (
    <div>
      <h1>Tenant ID: {tenantid}</h1>
    </div>
  );
}
