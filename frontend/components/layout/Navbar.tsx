'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUser, logout, isAuthenticated } from '../../utils/auth';
import { User } from '../../types/user';
import { getDashboardPath } from '../../utils/roles';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        // Check auth on mount
        const currentUser = getUser();
        setUser(currentUser);
    }, [pathname]); // Re-check on route change if needed, though usually state is global. 
    // For this simple structure without Context, this is a basic way to update UI on nav.

    const handleLogout = () => {
        logout();
        setUser(null);
    };

    const dashboardPath = user ? getDashboardPath(user.role) : '/';
    const eventsPath = user?.role === 'sponsor' ? '/sponsor/events' : '/events';

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-40" style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 40 }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
                <div className="flex justify-between h-16" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
                    <div className="flex" style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="flex-shrink-0 flex items-center" style={{ display: 'flex', alignItems: 'center' }}>
                            <Link href="/" className="text-xl font-bold text-indigo-600" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4F46E5', textDecoration: 'none' }}>
                                TheCubeFactory
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                href={eventsPath}
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === eventsPath
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                Browse Events
                            </Link>
                            {user && (
                                <Link
                                    href={dashboardPath}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname.startsWith(dashboardPath)
                                        ? 'border-blue-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    Dashboard
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        {user ? (
                            <div className="ml-3 relative flex items-center space-x-4">
                                <span className="text-sm text-gray-700">Hi, {user.name}</span>
                                <Button variant="outline" onClick={handleLogout} className="text-sm py-1">
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="space-x-2">
                                <Link href="/login">
                                    <Button variant="outline" className="text-sm">Log in</Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="text-sm">Register</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg
                                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <svg
                                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
                <div className="pt-2 pb-3 space-y-1">
                    <Link
                        href={eventsPath}
                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                    >
                        Browse Events
                    </Link>
                    {user && (
                        <Link
                            href={dashboardPath}
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                        >
                            Dashboard
                        </Link>
                    )}
                </div>
                <div className="pt-4 pb-4 border-t border-gray-200">
                    {user ? (
                        <div className="flex items-center px-4 justify-between">
                            <div className="text-base font-medium text-gray-800">{user.name}</div>
                            <Button variant="outline" onClick={handleLogout} className="text-sm py-1">
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2 px-4">
                            <Link href="/login" className="block w-full">
                                <Button variant="outline" className="w-full justify-center">Log in</Button>
                            </Link>
                            <Link href="/register" className="block w-full">
                                <Button className="w-full justify-center">Register</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
