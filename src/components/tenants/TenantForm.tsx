
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft, Globe, Palette, Shield, Disc } from "lucide-react";
import Link from "next/link";

// Types matching our backend
type TenantFeatures = {
    archive: boolean;
    punishments: boolean;
    discordNotify: boolean;
};

type TenantFormData = {
    id?: string;
    name: string;
    slug: string;
    // Branding
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    favicon?: string;
    customDomain?: string;
    // Features
    features: TenantFeatures;
    // Discord
    discordGuildId: string;
    discordClientId: string;
    discordClientSecret: string;
    discordRoleAdmin: string;
    discordRoleEvaluator?: string;
    discordRolePlayer?: string;
    isActive: boolean;
};

interface TenantFormProps {
    initialData?: TenantFormData;
    isEditing?: boolean;
}

const DEFAULT_DATA: TenantFormData = {
    name: "",
    slug: "",
    primaryColor: "#6366f1",
    secondaryColor: "#4f46e5",
    features: {
        archive: true,
        punishments: true,
        discordNotify: true
    },
    discordGuildId: "",
    discordClientId: "",
    discordClientSecret: "",
    discordRoleAdmin: "",
    isActive: true
};

export function TenantForm({ initialData, isEditing = false }: TenantFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState<TenantFormData>(initialData || DEFAULT_DATA);

    const handleChange = (field: keyof TenantFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFeatureToggle = (feature: keyof TenantFeatures) => {
        setFormData(prev => ({
            ...prev,
            features: {
                ...prev.features,
                [feature]: !prev.features[feature]
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const url = isEditing ? `/api/tenants/${formData.id}` : "/api/tenants";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Erro ao salvar");
            }

            router.push("/tenants");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/tenants" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white font-display">
                            {isEditing ? `Editar: ${formData.name}` : "Novo Cliente SaaS"}
                        </h1>
                        <p className="text-sm text-zinc-400">Configure os detalhes do painel do cliente.</p>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-all font-medium shadow-lg shadow-violet-900/20"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isEditing ? "Salvar Alterações" : "Criar Painel"}
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Main Info) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Basic Info */}
                    <Section title="Informações Básicas" icon={<Globe className='w-4 h-4 text-violet-400' />}>
                        <div className="grid md:grid-cols-2 gap-6">
                            <Input
                                label="Nome do Projeto"
                                value={formData.name}
                                onChange={v => handleChange("name", v)}
                                placeholder="Ex: Cidade Alta RP"
                                required
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Slug / Subdomínio</label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={e => handleChange("slug", e.target.value)}
                                        className="flex-1 bg-zinc-950/50 border border-white/10 rounded-l-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-violet-600/50"
                                        placeholder="cidadealta"
                                        pattern="[a-z0-9-]+"
                                    />
                                    <span className="bg-white/5 border border-white/10 border-l-0 rounded-r-xl px-4 flex items-center text-sm text-zinc-500 font-mono">
                                        .suaplataforma.com
                                    </span>
                                </div>
                            </div>
                            <Input
                                label="Domínio Personalizado (Opcional)"
                                value={formData.customDomain || ""}
                                onChange={v => handleChange("customDomain", v)}
                                placeholder="dashboard.cidadealta.com.br"
                                className="md:col-span-2"
                            />
                        </div>
                    </Section>

                    {/* Discord Integration */}
                    <Section title="Integração Discord" icon={<Disc className='w-4 h-4 text-indigo-400' />}>
                        <div className="space-y-6">
                            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-sm text-indigo-200/80">
                                O cliente deve criar uma aplicação no Discord Developer Portal e convidar o bot para o servidor.
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <Input label="Guild ID (Servidor)" value={formData.discordGuildId} onChange={v => handleChange("discordGuildId", v)} required mono />
                                <Input label="Role Admin ID" value={formData.discordRoleAdmin} onChange={v => handleChange("discordRoleAdmin", v)} required mono />
                                <Input label="Client ID (App)" value={formData.discordClientId} onChange={v => handleChange("discordClientId", v)} required mono />
                                <Input label="Client Secret" value={formData.discordClientSecret} onChange={v => handleChange("discordClientSecret", v)} required type="password" mono />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mt-2">Cargos Adicionais</h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                <Input label="Role Avaliador (Opcional)" value={formData.discordRoleEvaluator || ""} onChange={v => handleChange("discordRoleEvaluator", v)} mono />
                                <Input label="Role Player (Opcional)" value={formData.discordRolePlayer || ""} onChange={v => handleChange("discordRolePlayer", v)} mono />
                            </div>
                        </div>
                    </Section>
                </div>

                {/* Right Column (Settings & Branding) */}
                <div className="space-y-8">

                    {/* Features Flags */}
                    <Section title="Módulos (Features)" icon={<Shield className='w-4 h-4 text-emerald-400' />}>
                        <div className="space-y-4">
                            <FeatureToggle
                                label="Sistema de Punições"
                                description="Banimentos, advertências e whitelist."
                                active={formData.features.punishments}
                                onToggle={() => handleFeatureToggle("punishments")}
                            />
                            <FeatureToggle
                                label="Allowlist / Arquivo"
                                description="Histórico de aprovações e reprovações."
                                active={formData.features.archive}
                                onToggle={() => handleFeatureToggle("archive")}
                            />
                            <FeatureToggle
                                label="Notificações Discord"
                                description="Webhooks de logs para canais."
                                active={formData.features.discordNotify}
                                onToggle={() => handleFeatureToggle("discordNotify")}
                            />
                        </div>
                    </Section>

                    {/* Branding */}
                    <Section title="Branding e Estilo" icon={<Palette className='w-4 h-4 text-pink-400' />}>
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-medium text-zinc-400 mb-2 block">Cores do Tema</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <ColorPicker label="Primária" value={formData.primaryColor} onChange={v => handleChange("primaryColor", v)} />
                                    <ColorPicker label="Secundária" value={formData.secondaryColor} onChange={v => handleChange("secondaryColor", v)} />
                                </div>
                            </div>
                            <Input label="URL do Logo" value={formData.logo || ""} onChange={v => handleChange("logo", v)} placeholder="https://..." />
                            <Input label="URL do Favicon" value={formData.favicon || ""} onChange={v => handleChange("favicon", v)} placeholder="https://..." />
                        </div>
                    </Section>

                    {/* Status */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                        <label className="flex items-center justify-between cursor-pointer group">
                            <div>
                                <span className="block font-medium text-white group-hover:text-violet-400 transition-colors">Status do Painel</span>
                                <span className="text-xs text-zinc-500">Desativar impede acesso total ao painel.</span>
                            </div>
                            <div
                                onClick={() => handleChange("isActive", !formData.isActive)}
                                className={`w-12 h-6 rounded-full relative transition-colors ${formData.isActive ? "bg-emerald-500" : "bg-zinc-700"}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isActive ? "translate-x-6" : ""}`} />
                            </div>
                        </label>
                    </div>

                </div>
            </div>
        </form>
    );
}

// --- Subcomponents ---

function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                {icon}
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function Input({ label, value, onChange, placeholder, type = "text", required, mono, className }: any) {
    return (
        <div className={`space-y-2 ${className}`}>
            <label className="text-sm font-medium text-zinc-400">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                className={`w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-600/50 transition-all ${mono ? 'font-mono text-sm' : ''}`}
            />
        </div>
    );
}

function ColorPicker({ label, value, onChange }: any) {
    return (
        <div className="space-y-2">
            <span className="text-xs text-zinc-500">{label}</span>
            <div className="flex gap-2">
                <input
                    type="color"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="h-10 w-12 rounded bg-transparent cursor-pointer"
                />
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="flex-1 min-w-0 bg-zinc-950/50 border border-white/10 rounded-lg px-2 text-xs font-mono text-white uppercase"
                />
            </div>
        </div>
    );
}

function FeatureToggle({ label, description, active, onToggle }: any) {
    return (
        <div
            onClick={onToggle}
            className={`flex items-start justify-between p-3 rounded-xl border border-transparent cursor-pointer transition-all ${active ? "bg-violet-500/10 border-violet-500/20" : "hover:bg-white/5"}`}
        >
            <div>
                <span className={`block text-sm font-medium ${active ? "text-violet-200" : "text-zinc-300"}`}>{label}</span>
                <span className="text-xs text-zinc-500">{description}</span>
            </div>
            <div className={`w-10 h-5 mt-1 rounded-full relative transition-colors ${active ? "bg-violet-500" : "bg-zinc-700"}`}>
                <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${active ? "translate-x-5" : ""}`} />
            </div>
        </div>
    );
}
