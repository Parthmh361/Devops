'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { sponsorshipService } from '@/services/sponsorshipService';
import { User } from '@/types/user';
import { InviteSponsorModal } from '@/components/InviteSponsorModal';
import { Loader2, Sparkles, User as UserIcon } from 'lucide-react';

export default function OrganizerDashboard() {
    const [sponsors, setSponsors] = useState<User[]>([]);
    const [isLoadingSponsors, setIsLoadingSponsors] = useState(true);
    const [selectedSponsor, setSelectedSponsor] = useState<User | null>(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    useEffect(() => {
        fetchSponsors();
    }, []);

    const fetchSponsors = async () => {
        try {
            setIsLoadingSponsors(true);
            const data = await sponsorshipService.getAllSponsors();
            setSponsors(data);
        } catch (error) {
            console.error('Failed to fetch sponsors', error);
        } finally {
            setIsLoadingSponsors(false);
        }
    };

    const handleOpenInvite = (sponsor: User) => {
        setSelectedSponsor(sponsor);
        setIsInviteModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">Organizer Dashboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card title="Active Events">
                            <p className="text-3xl font-bold text-blue-600">3</p>
                            <p className="text-sm text-gray-500 mt-1">2 upcoming, 1 live</p>
                        </Card>
                        <Card title="Pending Proposals">
                            <p className="text-3xl font-bold text-yellow-500">5</p>
                            <p className="text-sm text-gray-500 mt-1">Waiting for sponsor review</p>
                        </Card>
                        <Card title="Total Funding">
                            <p className="text-3xl font-bold text-green-600">$12,500</p>
                            <p className="text-sm text-gray-500 mt-1">Raised this month</p>
                        </Card>
                    </div>

                    <Card title="Recent Activity">
                        <div className="space-y-4">
                            <p className="text-gray-600">No recent activity to show.</p>
                        </div>
                    </Card>
                </div>

                {/* Recommendations Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-900/10">
                        <div className="flex flex-col gap-1 mb-8">
                            <p className="text-blue-400 text-[9px] font-black uppercase tracking-[0.2em]">Smart Match</p>
                            <h3 className="text-xl font-black uppercase italic tracking-tight">Top <span className="text-blue-400">Sponsors</span></h3>
                        </div>

                        <div className="space-y-6">
                            {isLoadingSponsors ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-4 animate-pulse">
                                        <div className="h-10 w-10 bg-white/10 rounded-xl"></div>
                                        <div className="space-y-2">
                                            <div className="h-2 w-24 bg-white/10 rounded"></div>
                                            <div className="h-2 w-16 bg-white/5 rounded"></div>
                                        </div>
                                    </div>
                                ))
                            ) : sponsors.length === 0 ? (
                                <div className="text-center py-8">
                                    <UserIcon className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">No sponsors found</p>
                                </div>
                            ) : (
                                sponsors.map((sponsor) => (
                                    <div key={sponsor._id} className="group cursor-pointer">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                                {sponsor.logo ? <img src={sponsor.logo} alt="" className="w-full h-full object-cover rounded-xl" /> : sponsor.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black uppercase tracking-tight group-hover:text-blue-400 transition-colors">{sponsor.name}</p>
                                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest line-clamp-1">{sponsor.organizationName || 'Elite Sponsor'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between px-1">
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-1 w-1 bg-blue-500 rounded-full animate-pulse"></div>
                                                <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest leading-none">High Match</span>
                                            </div>
                                            <button
                                                onClick={() => handleOpenInvite(sponsor)}
                                                className="text-[8px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:text-blue-400 flex items-center gap-1"
                                            >
                                                Invite <Sparkles className="w-2.5 h-2.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button className="w-full mt-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-gray-900 transition-all duration-300">
                            View All Suggestions
                        </button>
                    </div>

                    <div className="bg-blue-50 rounded-[2.5rem] p-8 border border-blue-100">
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2">Pro Tip</p>
                        <p className="text-[11px] font-bold text-gray-900 leading-relaxed italic">
                            "Events with custom messages get 3x more sponsor engagement."
                        </p>
                    </div>
                </div>
            </div>

            <InviteSponsorModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                sponsor={selectedSponsor}
            />
        </div>
    );
}
