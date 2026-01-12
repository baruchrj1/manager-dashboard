
import { prisma } from "@/lib/prisma";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT";
export type AuditEntity = "TENANT" | "SETTINGS" | "SESSION";

interface LogAuditParams {
    action: AuditAction;
    entity: AuditEntity;
    entityId?: string;
    details?: Record<string, any>;
    adminId: string;
    adminEmail: string;
}

export const AuditService = {
    async log(params: LogAuditParams) {
        return prisma.auditLog.create({
            data: {
                action: params.action,
                entity: params.entity,
                entityId: params.entityId,
                details: params.details ? JSON.stringify(params.details) : null,
                adminId: params.adminId,
                adminEmail: params.adminEmail,
            }
        });
    },

    async getRecentLogs(limit = 50) {
        return prisma.auditLog.findMany({
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                admin: {
                    select: { name: true, email: true }
                }
            }
        });
    },

    async getLogsByEntity(entity: AuditEntity, entityId: string) {
        return prisma.auditLog.findMany({
            where: { entity, entityId },
            orderBy: { createdAt: "desc" },
            include: {
                admin: {
                    select: { name: true, email: true }
                }
            }
        });
    }
};
