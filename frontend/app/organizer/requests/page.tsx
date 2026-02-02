'use client';

import React, { useEffect, useState } from 'react';
import {
    Mail,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Building2,
    Calendar,
    ChevronDown,
    Search,
    Loader2
} from 'lucide-react';
import { sponsorshipService } from '@/services/sponsorshipService';
import { SponsorshipRequest } from '@/types/sponsorship';
import { cn } from '@/utils/cn';

export default function OrganizerRequestsPage() {
    const [requests, setRequests] = useState<SponsorshipRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actioningId, setActioningId] = useState<string | null>(null);
    const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        const next = new Set(expandedRequests);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedRequests(next);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const data = await sponsorshipService.getOrganizerRequests();
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (requestId: string, action: 'accept' | 'reject') => {
        try {
            setActioningId(requestId);
            if (action === 'accept') {
                await sponsorshipService.acceptRequest(requestId);
            } else {
                await sponsorshipService.rejectRequest(requestId);
            }
            // Update local state
            setRequests(prev => prev.map(r =>
                (r._id || r.id) === requestId ? { ...r, status: action === 'accept' ? 'accepted' : 'rejected' } : r
            ));
        } catch (error) {
            console.error('Action failed', error);
        } finally {
            setActioningId(null);
        }
    };

    if (isLoading) return <div className="h-screen bg-transparent flex items-center justify-center animate-pulse"></div>;

    return (
        <div className="space-y-12 p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase italic leading-none">
                        Inbound <span className="text-blue-600">Requests</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Review and manage incoming partnership inquiries from verified sponsors
                    </p>
                </div>

                <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 font-black">
                        <Clock className="w-3.5 h-3.5" /> {requests.filter(r => r.status === 'pending').length} Action Required
                    </div>
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Target Event</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sponsor Partner</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Decisive Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {requests.map((req) => (
                                <React.Fragment key={req._id || req.id}>
                                    <tr className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-gray-200">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[13px] font-black text-gray-900 uppercase tracking-tight">{req.event?.title}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Date: {new Date(req.event?.startDate || req.event?.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                                                        {req.sponsor?.name.charAt(0)}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[12px] font-black text-gray-900 uppercase tracking-tight">{req.sponsor?.name}</p>
                                                        <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">{req.sponsor?.organizationName || 'Premium Sponsor'}</p>
                                                    </div>
                                                </div>
                                                {req.message && (
                                                    <button
                                                        onClick={() => toggleExpand(req.id)}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-all",
                                                            expandedRequests.has(req.id) ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-gray-100 text-gray-400 hover:text-gray-900"
                                                        )}
                                                    >
                                                        <Mail className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                                req.status === 'accepted' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                    req.status === 'rejected' ? "bg-rose-50 text-rose-700 border-rose-100" :
                                                        "bg-amber-50 text-amber-700 border-amber-100"
                                            )}>
                                                {req.status === 'accepted' ? <CheckCircle2 className="w-3 h-3" /> :
                                                    req.status === 'rejected' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {req.status}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center justify-end gap-3">
                                                {req.status === 'pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(req._id || req.id, 'accept')}
                                                            disabled={!!actioningId}
                                                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
                                                        >
                                                            {actioningId === (req._id || req.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(req._id || req.id, 'reject')}
                                                            disabled={!!actioningId}
                                                            className="px-6 py-3 bg-white border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">Decision Finalized</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {
                                        expandedRequests.has(req.id) && (
                                            <tr className="bg-blue-50/30">
                                                <td colSpan={4} className="px-10 py-6">
                                                    <div className="p-6 bg-white border border-blue-100 rounded-3xl shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <div className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-widest italic px-1">
                                                            <Mail className="w-3 h-3" /> Proposal Message
                                                        </div>
                                                        <p className="text-xs font-bold text-gray-700 leading-relaxed">
                                                            {req.message}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    }
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {
                requests.length === 0 && (
                    <div className="py-24 bg-white rounded-[3rem] border border-gray-100 text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto opacity-50">
                            <Mail className="w-8 h-8 text-gray-200" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">No pending sponsorship requests</p>
                    </div>
                )
            }
        </div >
    );
}
