'use client';

import React from 'react';
import { Sidebar, MenuItem } from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

const menuItems: MenuItem[] = [
    { name: 'Dashboard', href: '/organizer' },
    { name: 'My Events', href: '/organizer/events' },
    { name: 'Inbound Requests', href: '/organizer/requests' },
    { name: 'Notifications', href: '/organizer/notifications' },
    { name: 'Proposals', href: '/organizer/proposals' },
    { name: 'Collaborations', href: '/organizer/collaborations' },
    { name: 'Profile', href: '/organizer/profile' },
];

export default function OrganizerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={['organizer']}>
            <div className="flex min-h-[calc(100vh-64px)] bg-gray-100">
                <Sidebar menuItems={menuItems} />
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
