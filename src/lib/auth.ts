
import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            authorization: { params: { scope: "identify email" } }, // Minimal scope for admin check
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async signIn({ user }) {
            // STRICT: Only allow Super Admin Emails
            const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());

            if (user.email && superAdmins.includes(user.email.toLowerCase())) {
                return true;
            }

            // Hardcoded bypass for BaruchRJ
            if (user.id === "405844020967899137") return true;

            return false; // Blocks anyone else
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;

                // Check if user exists in SuperAdmin table
                const superAdmin = await prisma.superAdmin.findUnique({
                    where: { email: user.email as string }
                });

                if (superAdmin) {
                    token.isSuperAdmin = true;
                } else {
                    // Also check environment variable list as fallback
                    const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
                    if (user.email && superAdmins.includes(user.email.toLowerCase())) {
                        token.isSuperAdmin = true;
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.isSuperAdmin = token.isSuperAdmin as boolean;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login", // We will create a simple login page for Manager
    }
};
