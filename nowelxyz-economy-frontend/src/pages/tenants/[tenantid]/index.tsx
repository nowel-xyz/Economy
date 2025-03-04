import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const tenantDataHeader = req.headers['x-tenant-data'];

    let tenantData = null;
    if (tenantDataHeader) {
        try {
            tenantData = JSON.parse(tenantDataHeader as string);
        } catch (e) {
            console.error('Failed to parse tenant data:', e);
        }
    }

    return {
        props: {
            tenantData,
        },
    };
};

const TenantPage = ({ tenantData }: { tenantData: any }) => {
    return (
        <div>
            <h1>Tenant Info</h1>
            <pre>{JSON.stringify(tenantData, null, 2)}</pre>
        </div>
    );
};

export default TenantPage;
