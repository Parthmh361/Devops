'use client';

import React from 'react';
import {
    Calendar,
    MapPin,
    Tag,
    Globe,
    CheckCircle2,
    CalendarDays,
    Info,
    ArrowUpRight
} from 'lucide-react';
import { Event } from '../../types/event';

interface EventDetailsProps {
    event: Event;
}

export default function EventDetails({ event }: EventDetailsProps) {
    return (
        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden relative">
            {/* Header Hero Area */}
            <div className="h-80 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-900 relative">
                <div className="absolute inset-0 bg-black/10"></div>

                {/* Visual Elements */}
                <div className="absolute top-0 right-0 p-12">
                    <div className="h-24 w-24 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white/40">
                        <CalendarDays className="w-12 h-12" />
                    </div>
                </div>

                <div className="absolute bottom-12 left-12 space-y-4 right-12">
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 bg-blue-500/30 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                            {event.category}
                        </span>
                        <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                            {event.eventMode} Engagement
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-[0.9]">
                        {event.title}
                    </h1>
                </div>
            </div>

            <div className="p-12 space-y-12">
                {/* Meta Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-gray-50">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Kick-off Date</p>
                        <div className="flex items-center gap-2 text-gray-900 font-black">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <span className="text-sm tracking-tight">{new Date(event.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Event Duration</p>
                        <div className="flex items-center gap-2 text-gray-900 font-black">
                            <CalendarDays className="w-5 h-5 text-emerald-500" />
                            <span className="text-sm tracking-tight text-emerald-600 uppercase">3 Full Days</span>
                        </div>
                    </div>

                    <div className="space-y-1 lg:col-span-2">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Primary Location</p>
                        <div className="flex items-center gap-2 text-gray-900 font-black">
                            <MapPin className="w-5 h-5 text-rose-500" />
                            <span className="text-sm tracking-tight uppercase truncate">{event.location}</span>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-1 bg-blue-600 w-12 rounded-full"></div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase italic">The Concept</h2>
                    </div>

                    <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed max-w-4xl">
                        {event.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                        <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100/50 space-y-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                                    <Info className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Project Vision</h3>
                            </div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-loose">
                                This event aims to bridge the gap between innovators and investors, creating a high-impact environment for sustainable growth.
                            </p>
                        </div>

                        <div className="p-8 bg-gray-900 rounded-[2rem] text-white space-y-4 shadow-xl shadow-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-white text-gray-900 rounded-xl flex items-center justify-center shadow-lg">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-tight text-white/80">Key Objectives</h3>
                            </div>
                            <div className="space-y-3">
                                {['Community Growth', 'Network Building', 'Global Visibility'].map((obj) => (
                                    <div key={obj} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/60">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                                        <span>{obj}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
