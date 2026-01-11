"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            localStorage.setItem("mario-racer-username", username);
            router.push("/menu");
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background-dark relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="z-10 w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="inline-flex justify-center items-center gap-3 mb-6 bg-white/5 backdrop-blur-sm py-2 px-6 rounded-full border border-white/10">
                        <span className="material-symbols-outlined text-accent animate-bounce">
                            star
                        </span>
                        <span className="text-white font-bold tracking-widest text-sm uppercase">Enter the Race</span>
                        <span className="material-symbols-outlined text-accent animate-bounce">
                            star
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter drop-shadow-glow">
                        DRIVER <span className="text-primary">LOGIN</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Identify yourself before hitting the track!</p>
                </div>

                <div className="bg-[#2a1617]/80 backdrop-blur-md rounded-2xl p-8 border border-border-dark shadow-2xl shadow-black/50">
                    <form onSubmit={handleLogin} className="flex flex-col gap-6">
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-bold text-slate-300 uppercase tracking-wider ml-1">
                                Racer Name
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-500 group-focus-within:text-primary transition-colors">
                                        badge
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-black/40 border border-border-dark rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-lg"
                                    placeholder="It's a me..."
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="group relative w-full flex items-center justify-center overflow-hidden rounded-xl bg-primary py-4 text-white font-black text-lg uppercase tracking-wider shadow-[0_4px_0_rgb(180,30,40)] hover:shadow-[0_2px_0_rgb(180,30,40)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Start Engine
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                                    sports_score
                                </span>
                            </span>
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-white/20 transition-transform duration-300 skew-x-12"></div>
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/" className="text-sm text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-1 group">
                            <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            Back to Garage
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
