'use client';

import React, { useEffect, useState } from 'react';
import {
    Bell,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronLeft,
    Calendar,
    ArrowRight,
    CircleDashed
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { sponsorshipService } from '@/services/sponsorshipService';
import { Notification } from '@/types/sponsorship';
import { cn } from '@/utils/cn';

export default function SponsorNotificationsPage() {
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
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-3 text-[10px] font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em] mb-4"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase italic leading-none">
                        Activity <span className="text-blue-600">Feed</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Track your sponsorship request status and system alerts
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5" /> {notifications.length} Total
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center space-y-4 shadow-sm">
                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                            <CircleDashed className="w-8 h-8 text-gray-200" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 uppercase">Clear Skies</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No notifications to display at this time.</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={cn(
                                "group relative bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden",
                                !notif.isRead && "border-l-4 border-l-blue-600"
                            )}
                        >
                            <div className="flex items-start gap-6">
                                <div className={cn(
                                    "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                                    notif.title.includes('Accepted') ? "bg-emerald-50 text-emerald-600" :
                                        notif.title.includes('Rejected') ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                                )}>
                                    {notif.title.includes('Accepted') ? <CheckCircle2 className="w-6 h-6" /> :
                                        notif.title.includes('Rejected') ? <XCircle className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
                                </div>

                                <div className="space-y-2 flex-grow">
                                    <div className="flex items-center justify-between gap-4">
                                        <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">{notif.title}</h4>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" /> {new Date(notif.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-xs font-bold leading-relaxed uppercase tracking-tight italic">
                                        {notif.message}
                                    </p>
                                </div>

                                {notif.relatedEntity?.id && (
                                    <button
                                        onClick={() => router.push(`/sponsor/events/${notif.relatedEntity?.id}`)}
                                        className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all group-hover:translate-x-1"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
