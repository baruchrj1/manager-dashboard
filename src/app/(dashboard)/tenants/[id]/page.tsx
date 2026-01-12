
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TenantForm } from "@/components/tenants/TenantForm";

interface EditTenantPageProps {
    params: Promise<{ id: string }>;
}

async function getTenant(id: string) {
    const tenant = await prisma.tenant.findUnique({
        where: { id }
    });

    if (!tenant) return null;

    // Parse features
    let features = { archive: true, punishments: true, discordNotify: true };
    try {
        features = JSON.parse(tenant.features);
    } catch { }

    return {
        ...tenant,
        features
    };
}

export default async function EditTenantPage({ params }: EditTenantPageProps) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isSuperAdmin) {
        redirect("/login");
    }

    const { id } = await params;
    const tenant = await getTenant(id);

    if (!tenant) {
        notFound();
    }

    return (
        <TenantForm
            initialData={{
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                primaryColor: tenant.primaryColor,
                secondaryColor: tenant.secondaryColor,
                logo: tenant.logo,
                favicon: tenant.favicon,
                customDomain: tenant.customDomain,
                features: tenant.features,
                discordGuildId: tenant.discordGuildId,
                discordClientId: tenant.discordClientId,
                discordClientSecret: tenant.discordClientSecret,
                discordRoleAdmin: tenant.discordRoleAdmin,
                discordRoleEvaluator: tenant.discordRoleEvaluator,
                discordRolePlayer: tenant.discordRolePlayer,
                isActive: tenant.isActive,
            }}
            isEditing={true}
        />
    );
}
