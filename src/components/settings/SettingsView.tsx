
"use client";

import { useState } from "react";
import { User, Shield, Key, Bell, HelpCircle, Mail, Lock, Smartphone, RefreshCw, Copy, Check } from "lucide-react";

export function SettingsView({ user }: { user: any }) {
    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div className="grid md:grid-cols-3 gap-8">
            {/* Sidebar Navigation */}
            <div className="space-y-2">
                <NavButton
                    active={activeTab === "profile"}
                    onClick={() => setActiveTab("profile")}
                    icon={<User className="w-4 h-4" />}
                    label="Perfil"
                />
                <NavButton
                    active={activeTab === "security"}
                    onClick={() => setActiveTab("security")}
                    icon={<Shield className="w-4 h-4" />}
                    label="Segurança"
                />
                <NavButton
                    active={activeTab === "notifications"}
                    onClick={() => setActiveTab("notifications")}
                    icon={<Bell className="w-4 h-4" />}
                    label="Notificações"
                />
                <NavButton
                    active={activeTab === "keys"}
                    onClick={() => setActiveTab("keys")}
                    icon={<Key className="w-4 h-4" />}
                    label="API Keys"
                />
                <NavButton
                    active={activeTab === "support"}
                    onClick={() => setActiveTab("support")}
                    icon={<HelpCircle className="w-4 h-4" />}
                    label="Suporte"
                />
            </div>

            {/* Content Area */}
            <div className="md:col-span-2 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

                {activeTab === "profile" && (
                    <div className="glass-card rounded-xl p-6 space-y-6">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                            <div className="w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-violet-500/20">
                                {user?.name?.[0] || "A"}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">{user?.name || "Admin User"}</h3>
                                <p className="text-sm text-zinc-500">Super Administrador</p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Email</label>
                                <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5">
                                    <Mail className="w-4 h-4 text-zinc-500" />
                                    <span className="text-zinc-400 flex-1">{user?.email || "admin@nexus.com"}</span>
                                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Verificado</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Cargo do Sistema</label>
                                <div className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-violet-400 font-bold uppercase text-xs tracking-wide">
                                    Super Admin
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "security" && (
                    <div className="space-y-6">
                        <div className="glass-card rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Shield className="w-5 h-5 text-emerald-400" />
                                <h3 className="font-semibold text-white">Segurança da Conta</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center">
                                            <Lock className="w-4 h-4 text-zinc-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">Senha</p>
                                            <p className="text-xs text-zinc-500">Última alteração há 3 meses</p>
                                        </div>
                                    </div>
                                    <button className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors">Alterar</button>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center">
                                            <Smartphone className="w-4 h-4 text-zinc-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">Autenticação em 2 Fatores</p>
                                            <p className="text-xs text-zinc-500">Proteja sua conta com 2FA</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-zinc-500 uppercase font-bold">Desativado</span>
                                        <div className="w-8 h-4 bg-zinc-700 rounded-full relative cursor-pointer opacity-50">
                                            <div className="w-4 h-4 bg-zinc-500 rounded-full absolute left-0" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "notifications" && (
                    <div className="glass-card rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Bell className="w-5 h-5 text-orange-400" />
                            <h3 className="font-semibold text-white">Preferências de Notificação</h3>
                        </div>
                        <div className="space-y-4">
                            <ToggleItem label="Novos Reports" description="Receber notificação quando um usuário criar um report." checked />
                            <ToggleItem label="Alertas de Sistema" description="Avisos sobre status da API e banco de dados." checked />
                            <ToggleItem label="Marketing" description="Novidades sobre o NexusManager." />
                        </div>
                    </div>
                )}

                {activeTab === "keys" && (
                    <div className="glass-card rounded-xl p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Key className="w-5 h-5 text-yellow-400" />
                            <div>
                                <h3 className="font-semibold text-white">Developer API Keys</h3>
                                <p className="text-xs text-zinc-500">Gerencie chaves de acesso para integrações externas.</p>
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-950/50 border border-yellow-500/20 rounded-lg">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Chave Pública (Public Key)</label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 font-mono text-sm text-yellow-100/80 bg-black/20 px-3 py-2 rounded border border-white/5 truncate">
                                    pk_live_51Mxz...92kd
                                </code>
                                <button className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <button className="text-sm font-medium text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5" />
                            Gerar nova chave
                        </button>
                    </div>
                )}

                {activeTab === "support" && (
                    <div className="glass-card rounded-xl p-6 text-center py-12">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                            <HelpCircle className="w-8 h-8 text-zinc-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Precisa de ajuda?</h3>
                        <p className="text-sm text-zinc-500 max-w-xs mx-auto mb-6">
                            Entre em contato com o suporte técnico ou consulte a documentação.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors">Documentação</button>
                            <button className="px-4 py-2 border border-zinc-700 text-white rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">Abrir Ticket</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function NavButton({ active, icon, label, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${active ? 'bg-white/5 text-white border border-white/5 shadow-inner' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
        >
            <span className={active ? "text-violet-400" : "text-zinc-600"}>{icon}</span>
            {label}
            {active && <span className="ml-auto w-1 h-1 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.5)]"></span>}
        </button>
    )
}

function ToggleItem({ label, description, checked }: any) {
    return (
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-zinc-500">{description}</p>
            </div>
            <div className={`w-10 h-5 mt-1 rounded-full relative transition-colors cursor-pointer ${checked ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
            </div>
        </div>
    );
}
