'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, DollarSign, Search, Filter, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { eventService } from '@/services/event.service';
import { Event } from '@/types/event';

export default function SponsorDiscoveryPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await eventService.getAllEvents();
                setEvents(data);
            } catch (error) {
                console.error('Failed to fetch events', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
                        Discover <span className="text-blue-600">Events</span>
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] italic">Premium Opportunities for Elite Sponsors</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative group flex-1 sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by Title, Location, or Genre"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-white border-2 border-gray-100 focus:border-blue-600 rounded-2xl outline-none transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-96 bg-gray-100 rounded-[3rem] animate-pulse"></div>
                    ))}
                </div>
            ) : filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEvents.map((event) => (
                        <div key={event._id} className="group relative bg-white border-2 border-gray-100 rounded-[3rem] p-8 hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500">
                            {/* Category Tag */}
                            <div className="absolute top-8 right-8 px-4 py-1.5 bg-gray-900 rounded-full">
                                <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">{event.category}</span>
                            </div>

                            <div className="space-y-6 h-full flex flex-col">
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {event.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <User className="w-3.5 h-3.5 text-blue-500" />
                                        <span className="text-[9px] font-black uppercase tracking-widest italic truncate overflow-hidden">
                                            {event.organizerId === '65bd1a2b3c4d5e6f7a8b9c0d' ? 'TechInc' : 'Elite Organizer'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-1 border border-gray-100 transition-colors group-hover:bg-white group-hover:border-blue-100">
                                        <div className="flex items-center gap-1.5 text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                            <Calendar className="w-2.5 h-2.5" /> Date
                                        </div>
                                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">
                                            {new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-1 border border-gray-100 transition-colors group-hover:bg-white group-hover:border-blue-100">
                                        <div className="flex items-center gap-1.5 text-[8px] font-black text-gray-400 uppercase tracking-widest text-emerald-500">
                                            <DollarSign className="w-2.5 h-2.5" /> Goal
                                        </div>
                                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">
                                            ${(event.amountRequired ?? 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-gray-500 pb-4 border-b border-gray-100">
                                    <MapPin className="w-3 h-3 text-blue-500" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest truncate">{event.location}</span>
                                </div>

                                <div className="mt-auto pt-6 flex items-center justify-between">
                                    <Link href={`/events/${event._id}`} className="flex-1">
                                        <Button className="w-full py-5 rounded-2xl bg-gray-900 hover:bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[9px] transition-all duration-300 flex items-center justify-center gap-2">
                                            Details <ArrowRight className="w-3 h-3" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Card className="p-20 border-dashed border-4 border-gray-100 bg-gray-50 rounded-[4rem]">
                    <div className="flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center">
                            <Search className="w-10 h-10 text-gray-200" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 italic">No Events Spotted</h3>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Adjust your search to find high-impact collaborations</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setSearchTerm('')}
                            className="mt-4 px-10 py-5 rounded-2xl border-2 border-gray-200 font-black uppercase tracking-[0.2em] text-[9px] hover:bg-white hover:border-gray-900 transition-all"
                        >
                            Reset Search
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
