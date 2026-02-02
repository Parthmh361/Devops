'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { sponsorshipService } from '@/services/sponsorshipService';
import { SponsorshipRequest } from '@/types/sponsorship';
import { CheckCircle2, Clock, XCircle, Calendar, MapPin, Loader2 } from 'lucide-react';

export default function SponsorDashboard() {
    const [requests, setRequests] = useState<SponsorshipRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const data = await sponsorshipService.getSponsorRequests();
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setIsLoading(false);
        }
    };

    const acceptedRequests = requests.filter(r => r.status === 'accepted');
    const pendingRequests = requests.filter(r => r.status === 'pending');

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">Sponsor Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Active Collaborations">
                    <p className="text-3xl font-bold text-blue-600">{acceptedRequests.length}</p>
                    <p className="text-sm text-gray-500 mt-1">Ongoing campaigns</p>
                </Card>
                <Card title="Pending Invitations">
                    <p className="text-3xl font-bold text-amber-600">{pendingRequests.length}</p>
                    <p className="text-sm text-gray-500 mt-1">Awaiting your response</p>
                </Card>
                <Card title="Budget Spent">
                    <p className="text-3xl font-bold text-green-600">$4,200</p>
                    <p className="text-sm text-gray-500 mt-1">This quarter</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Recommended Events">
                    <p className="text-gray-600">AI-driven recommendations coming soon.</p>
                </Card>

                <Card title="Recent Proposals">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                    ) : requests.length === 0 ? (
                        <p className="text-gray-600">No proposals yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {requests.slice(0, 5).map((request) => (
                                <div
                                    key={request._id || request.id}
                                    className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-gray-900">
                                                {request.event?.title || 'Event'}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                by {request.organizer?.name || 'Organizer'}
                                            </p>
                                        </div>
                                        <div className={`
                                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest
                                            ${request.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                request.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                                    'bg-amber-50 text-amber-700 border border-amber-100'}
                                        `}>
                                            {request.status === 'accepted' ? <CheckCircle2 className="w-3 h-3" /> :
                                                request.status === 'rejected' ? <XCircle className="w-3 h-3" /> :
                                                    <Clock className="w-3 h-3" />}
                                            {request.status}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-[10px] text-gray-500 mt-3">
                                        {request.event?.date && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(request.event.date).toLocaleDateString()}
                                            </div>
                                        )}
                                        {request.event?.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {request.event.location}
                                            </div>
                                        )}
                                    </div>

                                    {request.message && (
                                        <p className="text-xs text-gray-600 mt-3 italic line-clamp-2">
                                            "{request.message}"
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
