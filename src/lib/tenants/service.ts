import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
    createTenantSchema,
    updateTenantSchema,
    type CreateTenantInput,
    type UpdateTenantInput,
    type TenantFeatures
} from "./schema";

export type Tenant = {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
    customDomain: string | null;
    logo: string | null;
    favicon: string | null;
    primaryColor: string;
    secondaryColor: string;
    customCss: string | null;
    features: TenantFeatures;
    discordGuildId: string;
    discordClientId: string;
    discordClientSecret: string;
    discordBotToken: string | null;
    discordWebhookUrl: string | null;
    discordAdminChannel: string | null;
    discordRoleAdmin: string;
    discordRoleEvaluator: string | null;
    discordRolePlayer: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
        users: number;
        reports: number;
    };
};


// --- Helpers ---

const DEFAULT_FEATURES: TenantFeatures = {
    archive: true,
    punishments: true,
    discordNotify: true,
};

function parseFeatures(featuresJson: string): TenantFeatures {
    try {
        const parsed = JSON.parse(featuresJson);
        return { ...DEFAULT_FEATURES, ...parsed };
    } catch {
        return DEFAULT_FEATURES;
    }
}


// --- Service ---

export const TenantService = {

    async listTenants(): Promise<Tenant[]> {
        const tenants = await prisma.tenant.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { users: true, reports: true },
                },
            },
        });

        return tenants.map(t => ({
            ...t,
            features: parseFeatures(t.features),
        }));
    },

    async getTenantById(id: string): Promise<Tenant | null> {
        const tenant = await prisma.tenant.findUnique({
            where: { id },
        });

        if (!tenant) return null;

        return {
            ...tenant,
            features: parseFeatures(tenant.features),
        };
    },

    async createTenant(input: CreateTenantInput): Promise<Tenant> {
        // Validate input
        const data = createTenantSchema.parse(input);

        // Check availability
        const existing = await prisma.tenant.findUnique({
            where: { slug: data.slug },
        });

        if (existing) {
            throw new Error("Slug já está em uso");
        }

        const tenant = await prisma.tenant.create({
            data: {
                name: data.name,
                slug: data.slug,
                subdomain: data.slug, // Subdomain starts equal to slug
                discordGuildId: data.discordGuildId,
                discordClientId: data.discordClientId,
                discordClientSecret: data.discordClientSecret,
                discordRoleAdmin: data.discordRoleAdmin,
                discordRoleEvaluator: data.discordRoleEvaluator,
                discordRolePlayer: data.discordRolePlayer,
                primaryColor: data.primaryColor ?? "#6366f1",
                secondaryColor: data.secondaryColor ?? "#4f46e5",
                features: JSON.stringify(DEFAULT_FEATURES),
            },
        });

        return {
            ...tenant,
            features: parseFeatures(tenant.features),
        };
    },

    async updateTenant(id: string, input: UpdateTenantInput): Promise<Tenant> {
        // Validate
        const data = updateTenantSchema.parse(input);

        // Check slug uniqueness if changing
        if (data.slug) {
            const existing = await prisma.tenant.findUnique({ where: { slug: data.slug } });
            if (existing && existing.id !== id) {
                throw new Error("Slug já está em uso");
            }
        }

        // Prepare update data
        const updateData: any = { ...data };

        // Handle features JSON serialization
        if (data.features) {
            updateData.features = JSON.stringify(data.features);
        }

        // Keep subdomain synced if slug changes (optional policy, but good for now)
        if (data.slug) {
            updateData.subdomain = data.slug;
        }

        const tenant = await prisma.tenant.update({
            where: { id },
            data: updateData,
        });

        return {
            ...tenant,
            features: parseFeatures(tenant.features),
        };
    },

    async deleteTenant(id: string): Promise<void> {
        await prisma.tenant.delete({
            where: { id },
        });
    }
};
