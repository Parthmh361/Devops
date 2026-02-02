'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, DollarSign, AlignLeft, Tag, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { eventService } from '@/services/event.service';
import { EventCategory, EventMode } from '@/types/event';

export default function CreateEventPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Technology' as EventCategory,
        startDate: '',
        endDate: '',
        date: '',
        amountRequired: 0,
        location: '',
        eventMode: 'offline' as EventMode
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amountRequired' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Ensure the backend 'date' field is populated from the main start date
            const payload = {
                ...formData,
                date: formData.startDate
            };
            await eventService.createEvent(payload);
            router.push('/organizer/events');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create event');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black italic uppercase tracking-tight text-gray-900">
                    Create <span className="text-blue-600">New Event</span>
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Launch your next elite collaboration opportunity.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card className="p-8 bg-white border-2 border-gray-100 rounded-[2.5rem] shadow-xl shadow-blue-500/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Title */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
                                <Tag className="w-3 h-3 text-blue-500" /> Event Identity
                            </label>
                            <input
                                type="text"
                                name="title"
                                required
                                placeholder="Enter Event Title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-lg text-gray-900 placeholder:text-gray-300"
                            />
                        </div>

                        {/* Date & Time */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
                                <Calendar className="w-3 h-3 text-blue-500" /> Start Date
                            </label>
                            <input
                                type="datetime-local"
                                name="startDate"
                                required
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
                                <Clock className="w-3 h-3 text-blue-500" /> End Date
                            </label>
                            <input
                                type="datetime-local"
                                name="endDate"
                                required
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900"
                            />
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
                                <MapPin className="w-3 h-3 text-blue-500" /> Location / Venue
                            </label>
                            <input
                                type="text"
                                name="location"
                                required
                                placeholder="City, Country or Venue"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                            />
                        </div>

                        {/* Amount Required */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
                                <DollarSign className="w-3 h-3 text-blue-500" /> Sponsorship Goal ($)
                            </label>
                            <input
                                type="number"
                                name="amountRequired"
                                required
                                min="0"
                                placeholder="50000"
                                value={formData.amountRequired}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
                                <AlignLeft className="w-3 h-3 text-blue-500" /> Event Vision
                            </label>
                            <textarea
                                name="description"
                                required
                                rows={4}
                                placeholder="Describe the impact and scale of your event..."
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300 resize-none"
                            />
                        </div>

                        {/* Category & Mode */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
                                <Tag className="w-3 h-3 text-blue-500" /> Genre / Category
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 cursor-pointer"
                            >
                                <option value="Technology">Technology</option>
                                <option value="Business">Business</option>
                                <option value="Music">Music</option>
                                <option value="Art">Art</option>
                                <option value="Sports">Sports</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
                                <MapPin className="w-3 h-3 text-blue-500" /> Format
                            </label>
                            <select
                                name="eventMode"
                                value={formData.eventMode}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 cursor-pointer"
                            >
                                <option value="offline">In-person</option>
                                <option value="online">Virtual</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 font-bold text-xs uppercase tracking-widest">
                            {error}
                        </div>
                    )}

                    <div className="mt-10 flex gap-4">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-6 rounded-2xl bg-blue-600 hover:bg-gray-900 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : 'Launch Event'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="px-10 py-6 rounded-2xl border-2 border-gray-100 font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-all"
                        >
                            Cancel
                        </Button>
                    </div>
                </Card>
            </form>
        </div>
    );
}
