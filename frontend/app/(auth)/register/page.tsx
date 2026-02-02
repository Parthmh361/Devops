'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Mail,
    Lock,
    User,
    Loader2,
    LayoutGrid,
    Building2,
    Users,
    Sparkles
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { getDashboardPath } from '@/utils/roles';
import { cn } from '@/utils/cn';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('organizer');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await authService.register({ name, email, password, role });
            const redirectPath = getDashboardPath(response.user.role);
            router.push(redirectPath);
        } catch (err) {
            setError('Registration failed. Please attempt again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans">
            {/* Left Side: Illustration */}
            <div className="hidden lg:flex w-1/2 bg-[#7C3AED] items-center justify-center p-12 relative overflow-hidden order-last lg:order-first">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="relative z-10 w-full max-w-lg space-y-12">
                    <div className="space-y-6">
                        <h2 className="text-5xl font-bold text-white leading-tight">
                            Start your <br /> <span className="text-purple-200">Growth</span> Journey.
                        </h2>
                        <p className="text-xl text-purple-100 font-medium">
                            Join the ranks of premium event professionals and sponsors.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {[
                            { title: 'Global Exposure', desc: 'Reach thousands of vetted partners.', icon: <Sparkles /> },
                            { title: 'Secure Funding', desc: 'Streamlined sponsorship workflows.', icon: <LayoutGrid /> }
                        ].map((item) => (
                            <div key={item.title} className="flex items-start gap-4 p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{item.title}</h3>
                                    <p className="text-purple-100/70 text-sm mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-400/20 rounded-full blur-[100px]"></div>
            </div>

            {/* Right Side: Register Form */}
            <div className="w-full lg:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col bg-white">
                <div className="mb-12 flex items-center gap-2">
                    <div className="bg-[#6D28D9] p-1.5 rounded">
                        <LayoutGrid className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">TheCubeFactory</span>
                </div>

                <div className="max-w-md w-full mx-auto lg:mx-0 flex-grow flex flex-col justify-center">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">Create account</h1>
                        <p className="text-gray-500 font-medium">Empower your identity today</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleRegister}>
                        <div className="space-y-1.5 text-left">
                            <label className="text-sm font-semibold text-gray-700">Full Name</label>
                            <input
                                type="text"
                                required
                                placeholder="Enter your full name"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] outline-none transition-all"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5 text-left">
                            <label className="text-sm font-semibold text-gray-700">Email address</label>
                            <input
                                type="email"
                                required
                                placeholder="your@email.com"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] outline-none transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5 text-left">
                            <label className="text-sm font-semibold text-gray-700">Password</label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] outline-none transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <button
                                type="button"
                                onClick={() => setRole('organizer')}
                                className={cn(
                                    "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                                    role === 'organizer'
                                        ? "bg-purple-50 border-[#7C3AED]"
                                        : "bg-white border-gray-100 hover:border-purple-200"
                                )}
                            >
                                <Building2 className={cn("w-6 h-6", role === 'organizer' ? "text-[#7C3AED]" : "text-gray-400")} />
                                <span className={cn("text-[10px] font-bold uppercase", role === 'organizer' ? "text-gray-900" : "text-gray-400")}>Organizer</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('sponsor')}
                                className={cn(
                                    "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                                    role === 'sponsor'
                                        ? "bg-purple-50 border-[#7C3AED]"
                                        : "bg-white border-gray-100 hover:border-purple-200"
                                )}
                            >
                                <Users className={cn("w-6 h-6", role === 'sponsor' ? "text-[#7C3AED]" : "text-gray-400")} />
                                <span className={cn("text-[10px] font-bold uppercase", role === 'sponsor' ? "text-gray-900" : "text-gray-400")}>Sponsor</span>
                            </button>
                        </div>

                        {error && (
                            <div className="text-rose-600 text-[12px] font-bold">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg font-bold text-sm transition-all shadow-sm"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                "Sign up"
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-center lg:text-left text-sm font-medium text-gray-500">
                        Already have an account? <Link href="/login" className="text-[#7C3AED] font-bold hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
