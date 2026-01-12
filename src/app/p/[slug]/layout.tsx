
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface TenantLayoutProps {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}

async function getTenant(slug: string) {
    const tenant = await prisma.tenant.findUnique({
        where: { slug },
        select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            favicon: true,
            primaryColor: true,
            secondaryColor: true,
            isActive: true,
            discordClientId: true,
        }
    });
    return tenant;
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
    const { slug } = await params;
    const tenant = await getTenant(slug);

    if (!tenant) {
        notFound();
    }

    if (!tenant.isActive) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🚫</span>
                    </div>
                    <h1 className="text-xl font-bold text-white mb-2">Painel Desativado</h1>
                    <p className="text-zinc-500">Este painel está temporariamente indisponível.</p>
                </div>
            </div>
        );
    }

    // Inject tenant data into CSS variables
    const customStyles = `
        :root {
            --tenant-primary: ${tenant.primaryColor};
            --tenant-secondary: ${tenant.secondaryColor};
        }
    `;

    return (
        <html lang="pt-BR">
            <head>
                <title>{tenant.name}</title>
                {tenant.favicon && <link rel="icon" href={tenant.favicon} />}
                <style dangerouslySetInnerHTML={{ __html: customStyles }} />
            </head>
            <body className="bg-zinc-950 text-white antialiased min-h-screen">
                {/* Pass tenant context via data attributes for client components */}
                <div
                    id="tenant-root"
                    data-tenant-id={tenant.id}
                    data-tenant-name={tenant.name}
                    data-tenant-slug={tenant.slug}
                    data-tenant-logo={tenant.logo || ""}
                    data-tenant-discord-client-id={tenant.discordClientId}
                >
                    {children}
                </div>
            </body>
        </html>
    );
}
