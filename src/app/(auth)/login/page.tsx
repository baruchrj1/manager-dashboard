
"use client";
import { signIn } from "next-auth/react";
import { Shield } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]"></div>

            <div className="relative z-10 w-full max-w-md p-6">
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 mb-6 shadow-lg shadow-violet-900/20">
                        <Shield className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2 font-display">Super Manager</h1>
                    <p className="text-zinc-400 mb-8 text-sm">Acesso restrito ao gerenciamento SaaS.</p>

                    <button
                        onClick={() => signIn("discord", { callbackUrl: "/" })}
                        className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-900/20 group"
                    >
                        Entrar com Discord
                    </button>
                </div>
            </div>
        </div>
    );
}
