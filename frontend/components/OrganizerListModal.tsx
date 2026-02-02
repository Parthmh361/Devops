'use client';

import React, { useEffect, useState } from 'react';
import { X, User, Building2, Phone, Mail, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { User as UserType } from '@/types/user';
import { sponsorshipService } from '@/services/sponsorshipService';
import { cn } from '@/utils/cn';

interface OrganizerListModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: string;
    eventTitle: string;
}

export default function OrganizerListModal({ isOpen, onClose, eventId, eventTitle }: OrganizerListModalProps) {
    const [organizers, setOrganizers] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [requestingId, setRequestingId] = useState<string | null>(null);
    const [successId, setSuccessId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchOrganizers();
        }
    }, [isOpen, eventId]);

    const fetchOrganizers = async () => {
        try {
            setIsLoading(true);
            const data = await sponsorshipService.getEventOrganizers(eventId);
            setOrganizers(data);
        } catch (error) {
            console.error('Failed to fetch organizers', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = async (organizerId: string) => {
        try {
            setRequestingId(organizerId);
            await sponsorshipService.createRequest(eventId, organizerId);
            setSuccessId(organizerId);
            setTimeout(() => setSuccessId(null), 3000);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to send request');
        } finally {
            setRequestingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gray-900 p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="space-y-1">
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Partner Discovery</p>
                        <h2 className="text-3xl font-black uppercase italic tracking-tight">Contact <span className="text-blue-400">Organizers</span></h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-relaxed mt-2 line-clamp-1">
                            Event: {eventTitle}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Scanning Network...</p>
                        </div>
                    ) : organizers.length === 0 ? (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                <User className="w-8 h-8 text-gray-200" />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No active organizers found</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {organizers.map((org) => (
                                <div key={org.id} className="group bg-gray-50 rounded-[2rem] border border-gray-100 p-6 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 font-black text-xl border border-gray-100">
                                                {org.name.charAt(0)}
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">{org.name}</h4>
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                        <Building2 className="w-3 h-3" /> {org.organizationName || 'Independent'}
                                                    </span>
                                                    {org.designation && (
                                                        <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                                                    )}
                                                    {org.designation && (
                                                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{org.designation}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3 px-1 text-[10px] font-bold text-gray-500">
                                                <Mail className="w-3 h-3" /> {org.email}
                                            </div>
                                            {org.phone && (
                                                <div className="flex items-center gap-3 px-1 text-[10px] font-bold text-gray-500">
                                                    <Phone className="w-3 h-3" /> {org.phone}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleApply(org.id)}
                                            disabled={requestingId === org.id || successId === org.id}
                                            className={cn(
                                                "px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 min-w-[160px]",
                                                successId === org.id
                                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                    : "bg-blue-600 hover:bg-gray-900 text-white shadow-lg shadow-blue-500/10 active:scale-95"
                                            )}
                                        >
                                            {successId === org.id ? (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4" /> Sent
                                                </>
                                            ) : requestingId === org.id ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" /> Ask for Sponsorship
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 p-6 flex justify-center border-t border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] italic">
                        Connecting premium sponsors with elite organizers
                    </p>
                </div>
            </div>
        </div>
    );
}
