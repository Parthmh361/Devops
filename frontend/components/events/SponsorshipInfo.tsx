'use client';

import React from 'react';
import {
    CheckCircle2,
    Gift,
    DollarSign,
    Zap,
    Trophy,
    ArrowRight
} from 'lucide-react';
import { SponsorshipTier } from '../../types/event';
import { cn } from '../../utils/cn';

interface SponsorshipInfoProps {
    tiers: SponsorshipTier[];
}

export default function SponsorshipInfo({ tiers }: SponsorshipInfoProps) {
    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none italic">
                        Partner <span className="text-blue-600">Opportunities</span>
                    </h2>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Investment tiers and strategic benefits
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100 shadow-sm shadow-amber-100/20">
                    <Zap className="w-4 h-4" /> Exclusive Slots Available
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tiers.map((tier) => (
                    <div
                        key={tier.id}
                        className="group bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 flex flex-col h-full relative overflow-hidden"
                    >
                        {/* Decorative Gradient Line */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md"></div>

                        <div className="mb-10 flex items-start justify-between">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{tier.name}</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest uppercase">Tier {tier.id.slice(-3).toUpperCase()}</p>
                            </div>
                            <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                <Trophy className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="mb-10 p-6 bg-gray-50 group-hover:bg-blue-50 transition-colors rounded-[2rem] border border-gray-100 group-hover:border-blue-100 flex items-baseline gap-1">
                            <span className="text-3xl font-black text-gray-900 group-hover:text-blue-600 tracking-tighter transition-colors">${tier.amount.toLocaleString()}</span>
                            <span className="text-xs font-black text-gray-400 uppercase group-hover:text-blue-400 transition-colors tracking-widest">Entry</span>
                        </div>

                        <div className="space-y-4 mb-10 flex-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Gift className="w-3.5 h-3.5 text-blue-600" /> Executive Benefits
                            </p>
                            {tier.benefits?.map((benefit, idx) => (
                                <div key={idx} className="flex items-start gap-4">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 shadow-lg shadow-blue-100"></div>
                                    <span className="text-xs font-bold text-gray-600 leading-relaxed uppercase tracking-tight italic">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-gray-50">
                            <p className="text-[11px] font-medium text-gray-400 leading-relaxed italic mb-8 line-clamp-2">
                                {tier.description}
                            </p>

                            <button className="w-full py-4 bg-gray-900 group-hover:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all shadow-xl shadow-gray-200 group-hover:shadow-blue-200 flex items-center justify-center gap-3">
                                Apply for {tier.name} <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {tiers.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                        <DollarSign className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">No formal tiers listed yet</p>
                        <p className="text-xs text-gray-400 mt-2">Direct proposals are still welcomed by the organizer.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
