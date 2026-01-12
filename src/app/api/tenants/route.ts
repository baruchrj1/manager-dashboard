
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TenantService } from "@/lib/tenants/service";
import { z } from "zod";

// GET - List all tenants
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.isSuperAdmin) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
        }

        const tenants = await TenantService.listTenants();

        return NextResponse.json(tenants);
    } catch (error) {
        console.error("Erro ao listar tenants:", error);
        return NextResponse.json(
            { message: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

// POST - Create new tenant
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.isSuperAdmin) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
        }

        const body = await req.json();

        const tenant = await TenantService.createTenant(body);

        return NextResponse.json(tenant, { status: 201 });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: error.issues },
                { status: 400 }
            );
        }

        // Handle custom errors from service (like "Slug in use")
        if (error.message === "Slug já está em uso") {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        console.error("Erro ao criar tenant:", error);
        return NextResponse.json(
            { message: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
