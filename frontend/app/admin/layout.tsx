'use client';

import React from 'react';
import { Sidebar, MenuItem } from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

const menuItems: MenuItem[] = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Events', href: '/admin/events' },
    { name: 'Analytics', href: '/admin/analytics' },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="flex min-h-[calc(100vh-64px)] bg-gray-100">
                <Sidebar menuItems={menuItems} />
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
