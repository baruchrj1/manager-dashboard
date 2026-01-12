
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/auth/discord/[slug] - Redirect to Discord OAuth
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    // Fetch tenant
    const tenant = await prisma.tenant.findUnique({
        where: { slug },
        select: {
            id: true,
            discordClientId: true,
            discordGuildId: true,
            isActive: true,
        }
    });

    if (!tenant) {
        return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });
    }

    if (!tenant.isActive) {
        return NextResponse.json({ error: "Este painel está desativado" }, { status: 403 });
    }

    // Build Discord OAuth URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
    const redirectUri = `${baseUrl}/api/auth/discord/${slug}/callback`;

    const discordAuthUrl = new URL("https://discord.com/api/oauth2/authorize");
    discordAuthUrl.searchParams.set("client_id", tenant.discordClientId);
    discordAuthUrl.searchParams.set("redirect_uri", redirectUri);
    discordAuthUrl.searchParams.set("response_type", "code");
    discordAuthUrl.searchParams.set("scope", "identify guilds.members.read");
    discordAuthUrl.searchParams.set("state", slug); // Pass slug in state for callback

    return NextResponse.redirect(discordAuthUrl.toString());
}
