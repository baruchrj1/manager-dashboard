
import { TenantForm } from "@/components/tenants/TenantForm";
import { TenantService } from "@/lib/tenants/service";
import { notFound } from "next/navigation";

export default async function EditTenantPage({ params }: { params: Promise<{ tenantId: string }> }) {
    const { tenantId } = await params;
    const tenant = await TenantService.getTenantById(tenantId);

    if (!tenant) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto py-8">
            <TenantForm initialData={tenant} isEditing={true} />
        </div>
    );
}
