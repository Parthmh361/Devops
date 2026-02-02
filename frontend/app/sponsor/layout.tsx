'use client';

import React from 'react';
import { Sidebar, MenuItem } from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

const menuItems: MenuItem[] = [
    { name: 'Dashboard', href: '/sponsor' },
    { name: 'Browse Events', href: '/sponsor/events' },
    { name: 'My Proposals', href: '/sponsor/proposals' },
    { name: 'Collaborations', href: '/sponsor/collaborations' },
    { name: 'Profile', href: '/sponsor/profile' },
];

export default function SponsorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={['sponsor']}>
            <div className="flex min-h-[calc(100vh-64px)] bg-gray-100">
                <Sidebar menuItems={menuItems} />
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
