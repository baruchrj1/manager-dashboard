
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Discord API types
interface DiscordUser {
    id: string;
    username: string;
    avatar: string | null;
    global_name: string | null;
}

interface DiscordGuildMember {
    roles: string[];
    nick: string | null;
}

// GET /api/auth/discord/[slug]/callback - Handle OAuth callback
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        return NextResponse.redirect(`/p/${slug}?error=access_denied`);
    }

    if (!code) {
        return NextResponse.redirect(`/p/${slug}?error=no_code`);
    }

    // Fetch tenant with secrets
    const tenant = await prisma.tenant.findUnique({
        where: { slug },
        select: {
            id: true,
            discordClientId: true,
            discordClientSecret: true,
            discordGuildId: true,
            discordRoleAdmin: true,
            discordRoleEvaluator: true,
            discordRolePlayer: true,
        }
    });

    if (!tenant) {
        return NextResponse.redirect(`/p/${slug}?error=tenant_not_found`);
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
    const redirectUri = `${baseUrl}/api/auth/discord/${slug}/callback`;

    try {
        // Exchange code for token
        const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: tenant.discordClientId,
                client_secret: tenant.discordClientSecret,
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectUri,
            }),
        });

        if (!tokenResponse.ok) {
            console.error("Token exchange failed:", await tokenResponse.text());
            return NextResponse.redirect(`/p/${slug}?error=token_exchange_failed`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Get Discord user
        const userResponse = await fetch("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!userResponse.ok) {
            return NextResponse.redirect(`/p/${slug}?error=user_fetch_failed`);
        }

        const discordUser: DiscordUser = await userResponse.json();

        // Check if user is in the guild and get roles
        const memberResponse = await fetch(
            `https://discord.com/api/users/@me/guilds/${tenant.discordGuildId}/member`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!memberResponse.ok) {
            return NextResponse.redirect(`/p/${slug}?error=not_in_server`);
        }

        const memberData: DiscordGuildMember = await memberResponse.json();
        const userRoles = memberData.roles;

        // Determine user role based on Discord roles
        let userRole = "PLAYER";
        let isAdmin = false;

        if (userRoles.includes(tenant.discordRoleAdmin)) {
            userRole = "ADMIN";
            isAdmin = true;
        } else if (tenant.discordRoleEvaluator && userRoles.includes(tenant.discordRoleEvaluator)) {
            userRole = "EVALUATOR";
        } else if (tenant.discordRolePlayer && userRoles.includes(tenant.discordRolePlayer)) {
            userRole = "PLAYER";
        } else {
            // User doesn't have any of the required roles
            return NextResponse.redirect(`/p/${slug}?error=no_permission`);
        }

        // Upsert user in database
        const user = await prisma.user.upsert({
            where: {
                discordId_tenantId: {
                    discordId: discordUser.id,
                    tenantId: tenant.id,
                }
            },
            update: {
                username: discordUser.global_name || discordUser.username,
                avatar: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null,
                role: userRole,
                isAdmin,
            },
            create: {
                discordId: discordUser.id,
                username: discordUser.global_name || discordUser.username,
                avatar: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null,
                role: userRole,
                isAdmin,
                tenantId: tenant.id,
            }
        });

        // Create session token (simple JWT-like token for demo purposes)
        const sessionPayload = {
            userId: user.id,
            tenantId: tenant.id,
            tenantSlug: slug,
            role: userRole,
            isAdmin,
            exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        };

        const sessionToken = Buffer.from(JSON.stringify(sessionPayload)).toString("base64");

        // Set cookie and redirect to tenant dashboard
        const cookieStore = await cookies();
        cookieStore.set(`tenant_session_${slug}`, sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: `/p/${slug}`,
        });

        return NextResponse.redirect(`${baseUrl}/p/${slug}/dashboard`);

    } catch (error) {
        console.error("OAuth callback error:", error);
        return NextResponse.redirect(`/p/${slug}?error=internal_error`);
    }
}
