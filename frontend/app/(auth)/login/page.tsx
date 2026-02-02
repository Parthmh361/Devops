'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Mail,
    Lock,
    ArrowRight,
    Loader2,
    LayoutGrid
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { getDashboardPath } from '@/utils/roles';
import { cn } from '@/utils/cn';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await authService.login({ email, password });
            const redirectPath = getDashboardPath(response.user.role);
            router.push(redirectPath);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Account verification failed. Please check your credentials.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const setDemoAccount = (accEmail: string) => {
        setEmail(accEmail);
        setPassword('password123');
    };

    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'white' }}>
            <style>{`
                .emergency-flex { display: flex !important; }
                .emergency-col { flex-direction: column !important; }
                .emergency-row { flex-direction: row !important; }
                .emergency-center { align-items: center !important; justify-content: center !important; }
                .emergency-w-half { width: 50% !important; }
                .emergency-w-full { width: 100% !important; }
                @media (max-width: 1024px) {
                    .emergency-row-to-col { flex-direction: column !important; }
                    .emergency-w-half { width: 100% !important; }
                }
            `}</style>
            {/* Left Side: Login Form */}
            <div className="w-full lg:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col" style={{ width: '50%', padding: '4rem', display: 'flex', flexDirection: 'column' }}>
                <div className="mb-16 flex items-center gap-2" style={{ marginBottom: '4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="bg-[#6D28D9] p-1.5 rounded" style={{ backgroundColor: '#6D28D9', padding: '6px', borderRadius: '4px' }}>
                        <LayoutGrid className="w-5 h-5 text-white" style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>TheCubeFactory</span>
                </div>

                <div className="max-w-md w-full mx-auto lg:mx-0 flex-grow flex flex-col justify-center">
                    <div className="mb-10">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome back</h1>
                        <p className="text-gray-500 font-medium">Please enter your details</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-1.5" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label className="text-sm font-semibold text-gray-700" style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Email address</label>
                            <input
                                type="email"
                                required
                                placeholder="Enter your email"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] outline-none transition-all"
                                style={{ width: '100%', height: '48px', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 16px', fontSize: '14px' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label className="text-sm font-semibold text-gray-700" style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Password</label>
                            <input
                                type="password"
                                required
                                placeholder="Enter your password"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] outline-none transition-all"
                                style={{ width: '100%', height: '48px', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 16px', fontSize: '14px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between pb-2">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="remember" className="h-4 w-4 rounded border-gray-300 text-[#7C3AED] focus:ring-[#7C3AED]" />
                                <label htmlFor="remember" className="text-sm font-semibold text-gray-700">Remember for 30 days</label>
                            </div>
                            <Link href="#" className="text-sm font-bold text-[#7C3AED] hover:underline">Forgot password</Link>
                        </div>

                        {error && (
                            <div className="text-rose-600 text-[12px] font-bold">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg font-bold text-sm transition-all shadow-sm"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : (
                                    "Sign in"
                                )}
                            </Button>

                            <button
                                type="button"
                                className="w-full py-3.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-3 relative"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                            >
                                <img
                                    src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
                                    style={{ width: '20px', height: '20px' }}
                                    alt="Google"
                                />
                                Sign in with Google
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center lg:text-left text-sm font-medium text-gray-500">
                        Don't have an account? <Link href="/register" className="text-[#7C3AED] font-bold hover:underline">Sign up</Link>
                    </p>

                    {/* Discreet Demo Portal for Dev convenience */}
                    <div className="mt-12 pt-8 border-t border-gray-100 grid grid-cols-3 gap-3">
                        {['Organizer', 'Sponsor', 'Admin'].map((roleName) => (
                            <button
                                key={roleName}
                                onClick={() => setDemoAccount(`${roleName.toLowerCase()}@test.com`)}
                                className="py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#7C3AED] border border-dashed border-gray-200 rounded hover:border-[#7C3AED] transition-all"
                            >
                                {roleName}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side: Visual Illustration */}
            <div className="hidden lg:flex w-1/2 bg-[#A78BFA] items-center justify-center p-12 relative overflow-hidden" style={{ display: 'flex', width: '50%', backgroundColor: '#A78BFA', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                {/* Generated Illustration Image */}
                <div className="relative z-10 w-full max-w-xl animate-in fade-in zoom-in duration-1000">
                    <img
                        src="/assets/login-illustration.png"
                        alt="Support Illustration"
                        className="w-full h-auto drop-shadow-2xl rounded-[3rem]"
                    />
                </div>

                {/* Floating Decoration */}
                <div className="absolute top-[10%] right-[10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-[20%] left-[5%] w-48 h-48 bg-purple-900/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}
