
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuditService } from "@/lib/audit/service";

// GET /api/audit - Get recent audit logs
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isSuperAdmin) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const logs = await AuditService.getRecentLogs(100);

    // Parse details JSON
    const parsedLogs = logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
    }));

    return NextResponse.json(parsedLogs);
}
