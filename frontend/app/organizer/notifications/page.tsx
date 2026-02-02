'use client';

import React, { useEffect, useState } from 'react';
import {
    Bell,
    MessageSquare,
    ArrowRight,
    Calendar,
    ChevronLeft,
    Inbox
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { sponsorshipService } from '@/services/sponsorshipService';
import { Notification } from '@/types/sponsorship';
import { cn } from '@/utils/cn';

export default function OrganizerNotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const data = await sponsorshipService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="h-screen bg-gray-50 flex items-center justify-center animate-pulse rounded-[3rem]"></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20 p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase italic leading-none">
                        Pulse <span className="text-blue-600">Notifications</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Operational alerts and incoming partnership inquiries
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="px-6 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Inbox className="w-3.5 h-3.5" /> {notifications.length} Alerts
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="bg-white p-24 rounded-[3rem] border border-gray-100 text-center space-y-4 shadow-sm">
                        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto opacity-50">
                            <Bell className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 uppercase">System Idle</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">You're all caught up with your alerts.</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif._id || notif.id}
                            className={cn(
                                "group relative bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500",
                                !notif.isRead && "border-l-4 border-l-blue-600"
                            )}
                        >
                            <div className="flex items-start gap-8">
                                <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                                    <MessageSquare className="w-8 h-8" />
                                </div>

                                <div className="space-y-3 flex-grow">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight italic group-hover:text-blue-600 transition-colors">{notif.title}</h4>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-full">
                                            <Calendar className="w-3.5 h-3.5" /> {new Date(notif.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm font-bold leading-relaxed uppercase tracking-tight italic border-l-2 border-gray-100 pl-4 py-1">
                                        {notif.message}
                                    </p>
                                </div>

                                <button
                                    onClick={() => router.push('/organizer/requests')}
                                    className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all group-hover:translate-x-2 shadow-sm"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
