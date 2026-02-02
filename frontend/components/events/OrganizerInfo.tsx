'use client';

import React from 'react';
import {
    Building2,
    Globe,
    Phone,
    ShieldCheck,
    ArrowRight,
    Trophy,
    MessageCircle
} from 'lucide-react';

interface OrganizerPreview {
    id: string;
    name: string;
    organizationName: string;
    bio: string;
    logo?: string;
    website?: string;
}

interface OrganizerInfoProps {
    organizer: OrganizerPreview;
}

export default function OrganizerInfo({ organizer }: OrganizerInfoProps) {
    return (
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-10 relative overflow-hidden group">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gray-50 rounded-full blur-3xl -mr-24 -mt-24 group-hover:bg-blue-50 transition-colors duration-700"></div>

            <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative shrink-0">
                    <div className="h-28 w-28 rounded-[2.5rem] bg-gradient-to-br from-gray-900 to-blue-900 p-1 shadow-2xl shadow-blue-500/10 active:scale-95 transition-transform">
                        <div className="h-full w-full bg-white rounded-[2.3rem] flex items-center justify-center overflow-hidden">
                            {organizer.logo ? (
                                <img src={organizer.logo} alt={organizer.name} className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="w-10 h-10 text-gray-200" />
                            )}
                        </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center text-white shadow-lg">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">{organizer.organizationName}</h3>
                        <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-blue-100 shadow-sm self-center md:self-auto">
                            Verified Host
                        </span>
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">Strategic Organizer Profile</p>

                    <div className="flex wrap items-center justify-center md:justify-start gap-4 pt-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 px-4 py-2 rounded-xl">
                            <Trophy className="w-4 h-4 text-amber-500" /> 24+ Events
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 px-4 py-2 rounded-xl">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" /> 98% Rating
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative space-y-6 pt-6 border-t border-gray-50">
                <p className="text-gray-500 font-medium leading-relaxed italic text-sm">
                    {organizer.bio || "Dedicated event orchestration team focused on high-conversion partnership environments and networking excellence."}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {organizer.website && (
                        <a
                            href={organizer.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-blue-50 hover:border-blue-100 transition-all group/link"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <Globe className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/link:text-blue-600 transition-colors">Official Website</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover/link:text-blue-600 transition-colors" />
                        </a>
                    )}
                    <button className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-emerald-50 hover:border-emerald-100 transition-all group/link">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                <MessageCircle className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/link:text-emerald-600 transition-colors">Direct Inquiry</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover/link:text-emerald-600 transition-colors" />
                    </button>
                </div>
            </div>
        </div>
    );
}
