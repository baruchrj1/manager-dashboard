
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TenantService } from "@/lib/tenants/service";
import { z } from "zod";

// GET - Get single tenant
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ tenantId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isSuperAdmin) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
        }

        const { tenantId } = await params;
        const tenant = await TenantService.getTenantById(tenantId);

        if (!tenant) {
            return NextResponse.json({ message: "Tenant não encontrado" }, { status: 404 });
        }

        return NextResponse.json(tenant);
    } catch (error) {
        console.error("Erro ao buscar tenant:", error);
        return NextResponse.json(
            { message: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

// PUT - Update tenant
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ tenantId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isSuperAdmin) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
        }

        const { tenantId } = await params;
        const body = await req.json();

        // Remove empty strings to avoid wiping data with "" if coming from basic forms
        // (The service schema handles optionals, but empty string vs undefined is tricky in JS forms)
        // Ideally frontend handles this, but safety net:
        Object.keys(body).forEach(key => {
            if (body[key] === "") {
                body[key] = null; // or undefined
            }
        });

        const tenant = await TenantService.updateTenant(tenantId, body);

        return NextResponse.json(tenant);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: error.issues },
                { status: 400 }
            );
        }

        if (error.message === "Slug já está em uso") {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        console.error("Erro ao atualizar tenant:", error);
        return NextResponse.json(
            { message: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

// DELETE - Delete tenant
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ tenantId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isSuperAdmin) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
        }

        const { tenantId } = await params;

        await TenantService.deleteTenant(tenantId);

        return NextResponse.json({ message: "Tenant removido com sucesso" });
    } catch (error) {
        console.error("Erro ao deletar tenant:", error);
        // Prisma error P2003 (Foreign key constraint failed)
        if ((error as any).code === 'P2003') {
            return NextResponse.json(
                { message: "Não é possível apagar este tenant pois ele possui dados vinculados (usuários, relatórios, etc)." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
