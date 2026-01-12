
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { LayoutDashboard, FileText, Users, Settings, LogOut, Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface DashboardPageProps {
    params: Promise<{ slug: string }>;
}

async function getSessionAndTenant(slug: string) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(`tenant_session_${slug}`)?.value;

    if (!sessionToken) {
        return null;
    }

    try {
        const payload = JSON.parse(Buffer.from(sessionToken, "base64").toString());

        // Check expiration
        if (payload.exp < Date.now()) {
            return null;
        }

        // Fetch user and tenant
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true,
                        primaryColor: true,
                        secondaryColor: true,
                        features: true,
                    }
                }
            }
        });

        if (!user || user.tenant.slug !== slug) {
            return null;
        }

        return { user, tenant: user.tenant };
    } catch {
        return null;
    }
}

export default async function TenantDashboardPage({ params }: DashboardPageProps) {
    const { slug } = await params;
    const session = await getSessionAndTenant(slug);

    if (!session) {
        redirect(`/p/${slug}?error=session_expired`);
    }

    const { user, tenant } = session;

    // Parse features
    let features = { archive: true, punishments: true, discordNotify: true };
    try {
        features = JSON.parse(tenant.features as string);
    } catch { }

    return (
        <div className="min-h-screen bg-zinc-950 flex">
            {/* Sidebar */}
            <aside
                className="w-64 border-r border-white/5 flex flex-col"
                style={{ background: `linear-gradient(180deg, ${tenant.primaryColor}10 0%, transparent 50%)` }}
            >
                {/* Brand */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        {tenant.logo ? (
                            <img src={tenant.logo} alt={tenant.name} className="w-10 h-10 rounded-lg object-contain" />
                        ) : (
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-white"
                                style={{ background: `linear-gradient(135deg, ${tenant.primaryColor}, ${tenant.secondaryColor})` }}
                            >
                                {tenant.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 className="font-bold text-white text-sm">{tenant.name}</h1>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    <NavLink href={`/p/${slug}/dashboard`} icon={<LayoutDashboard className="w-4 h-4" />} label="Visão Geral" active />
                    <NavLink href={`/p/${slug}/reports`} icon={<FileText className="w-4 h-4" />} label="Reports" />
                    {features.punishments && (
                        <NavLink href={`/p/${slug}/punishments`} icon={<AlertTriangle className="w-4 h-4" />} label="Punições" />
                    )}
                    {user.isAdmin && (
                        <>
                            <div className="pt-4 pb-2">
                                <span className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Admin</span>
                            </div>
                            <NavLink href={`/p/${slug}/users`} icon={<Users className="w-4 h-4" />} label="Usuários" />
                            <NavLink href={`/p/${slug}/settings`} icon={<Settings className="w-4 h-4" />} label="Configurações" />
                        </>
                    )}
                </nav>

                {/* User */}
                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.username}</p>
                            <p className="text-xs text-zinc-500">{user.role}</p>
                        </div>
                        <Link
                            href={`/p/${slug}/logout`}
                            className="text-zinc-600 hover:text-red-400 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-5xl mx-auto">
                    {/* Welcome */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white">Bem-vindo, {user.username}!</h1>
                        <p className="text-zinc-500 text-sm mt-1">Aqui está o resumo do seu painel.</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            label="Reports Pendentes"
                            value="0"
                            color={tenant.primaryColor}
                            icon={<FileText className="w-5 h-5" />}
                        />
                        <StatCard
                            label="Punições Ativas"
                            value="0"
                            color="#ef4444"
                            icon={<AlertTriangle className="w-5 h-5" />}
                        />
                        <StatCard
                            label="Seu Cargo"
                            value={user.role}
                            color="#10b981"
                            icon={<Shield className="w-5 h-5" />}
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                        <h2 className="font-semibold text-white mb-4">Ações Rápidas</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <ActionButton label="Novo Report" href={`/p/${slug}/reports/new`} />
                            <ActionButton label="Ver Reports" href={`/p/${slug}/reports`} />
                            {features.punishments && <ActionButton label="Ver Punições" href={`/p/${slug}/punishments`} />}
                            {user.isAdmin && <ActionButton label="Configurações" href={`/p/${slug}/settings`} />}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active
                    ? "bg-white/5 text-white"
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                }`}
        >
            {icon}
            {label}
        </Link>
    );
}

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${color}20`, color }}
                >
                    {icon}
                </div>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-zinc-500">{label}</p>
        </div>
    );
}

function ActionButton({ label, href }: { label: string; href: string }) {
    return (
        <Link
            href={href}
            className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-white/5 rounded-lg text-sm font-medium text-white text-center transition-colors"
        >
            {label}
        </Link>
    );
}
