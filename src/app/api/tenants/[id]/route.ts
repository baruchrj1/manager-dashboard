
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const updateTenantSchema = z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/).optional(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    logo: z.string().url().optional().nullable(),
    favicon: z.string().url().optional().nullable(),
    customDomain: z.string().optional().nullable(),
    discordGuildId: z.string().min(17).optional(),
    discordClientId: z.string().min(17).optional(),
    discordClientSecret: z.string().min(10).optional(),
    discordRoleAdmin: z.string().min(17).optional(),
    discordRoleEvaluator: z.string().optional().nullable(),
    discordRolePlayer: z.string().optional().nullable(),
    features: z.object({
        archive: z.boolean(),
        punishments: z.boolean(),
        discordNotify: z.boolean(),
    }).optional(),
    isActive: z.boolean().optional(),
});

// GET /api/tenants/[id] - Get single tenant
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isSuperAdmin) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { id },
        include: {
            _count: {
                select: { users: true, reports: true }
            }
        }
    });

    if (!tenant) {
        return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
        ...tenant,
        features: JSON.parse(tenant.features)
    });
}

// PUT /api/tenants/[id] - Update tenant
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isSuperAdmin) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const body = await request.json();
        const data = updateTenantSchema.parse(body);

        // Check if slug is being changed and if it's unique
        if (data.slug) {
            const existing = await prisma.tenant.findFirst({
                where: {
                    slug: data.slug,
                    NOT: { id }
                }
            });

            if (existing) {
                return NextResponse.json({ error: "Slug já está em uso" }, { status: 400 });
            }
        }

        const tenant = await prisma.tenant.update({
            where: { id },
            data: {
                ...data,
                subdomain: data.slug || undefined, // Keep subdomain in sync with slug
                features: data.features ? JSON.stringify(data.features) : undefined,
            }
        });

        return NextResponse.json({
            ...tenant,
            features: JSON.parse(tenant.features)
        });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }
        console.error("Update tenant error:", error);
        return NextResponse.json({ error: "Erro ao atualizar tenant" }, { status: 500 });
    }
}

// DELETE /api/tenants/[id] - Delete tenant
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isSuperAdmin) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id } = await params;

    try {
        await prisma.tenant.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete tenant error:", error);
        return NextResponse.json({ error: "Erro ao deletar tenant" }, { status: 500 });
    }
}
