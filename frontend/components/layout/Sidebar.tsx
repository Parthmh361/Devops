'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface MenuItem {
    name: string;
    href: string;
    icon?: React.ReactNode;
}

interface SidebarProps {
    menuItems: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ menuItems }) => {
    const pathname = usePathname();

    return (
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white h-full min-h-screen">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex-1 px-2 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                {item.icon && <span className="mr-3 flex-shrink-0 h-6 w-6">{item.icon}</span>}
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
