
import Link from "next/link";
import { Plus, Search, ExternalLink, Settings, MoreHorizontal } from "lucide-react";
import { prisma } from "@/lib/prisma";

// Server Component
export default async function TenantsPage() {
    const tenants = await prisma.tenant.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { users: true } }
        }
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-display">Clientes SaaS</h1>
                    <p className="text-zinc-400 mt-1">Gerencie os painéis ativos e suas configurações.</p>
                </div>
                <Link
                    href="/tenants/new"
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-lg shadow-violet-900/20 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Novo Painel
                </Link>
            </div>

            {/* List */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Cliente</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">URL / Domínio</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                            <th className="text-right px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {tenants.map((tenant) => (
                            <tr key={tenant.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-inner"
                                            style={{ backgroundColor: tenant.primaryColor }}
                                        >
                                            {tenant.logo ?
                                                <img src={tenant.logo} className="w-full h-full object-cover rounded-lg" />
                                                : tenant.name.charAt(0)
                                            }
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{tenant.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                                                    ID: {tenant.discordGuildId.slice(0, 4)}...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-zinc-300">{tenant.subdomain}.suaplataforma.com</span>
                                        {tenant.customDomain && (
                                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                                                <GlobeIcon className="w-3 h-3" /> {tenant.customDomain}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {tenant.isActive ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            Ativo
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                            Inativo
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            href={`/tenants/${tenant.id}`}
                                            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                            title="Configurar"
                                        >
                                            <Settings className="w-4 h-4" />
                                        </Link>
                                        <a
                                            href={`https://${tenant.subdomain}.suaplataforma.com`}
                                            target="_blank"
                                            className="p-2 text-zinc-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors"
                                            title="Acessar Painel"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {tenants.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                    Nenhum painel criado ainda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function GlobeIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}
