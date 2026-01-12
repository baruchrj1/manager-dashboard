
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string;
            isSuperAdmin: boolean;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        isSuperAdmin?: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        isSuperAdmin?: boolean;
    }
}
