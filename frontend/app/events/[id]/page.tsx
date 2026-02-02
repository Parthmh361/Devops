'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import OrganizerListModal from '@/components/OrganizerListModal';
import { eventService } from '@/services/event.service';
import { Event } from '@/types/event';
import { getUser, isAuthenticated } from '@/utils/auth';

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: eventId } = React.use(params);
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const data = await eventService.getPublicEventById(eventId);

                if (data) {
                    setEvent(data);
                } else {
                    // Fallback to mock data for demo consistency
                    setEvent({
                        _id: eventId,
                        id: eventId,
                        title: 'Tech Start Competition 2026',
                        description: 'The biggest tech startup competition on the West Coast. Join us to see the future of technology.',
                        category: 'Technology',
                        startDate: '2026-06-15T00:00:00.000Z',
                        endDate: '2026-06-18T00:00:00.000Z',
                        date: '2026-06-15',
                        amountRequired: 50000,
                        location: 'San Francisco, CA',
                        eventMode: 'offline',
                        status: 'Published',
                        isApproved: true,
                        organizerId: '65bd1a2b3c4d5e6f7a8b9c0d', // Placeholder
                        sponsorshipTiers: [
                            { id: '1', name: 'Gold', amount: 10000, description: 'Premium benefits', benefits: ['Logo placement', 'Booth space', 'Keynote mention'] },
                            { id: '2', name: 'Silver', amount: 5000, description: 'Standard benefits', benefits: ['Logo placement', 'Booth space'] },
                            { id: '3', name: 'Bronze', amount: 2000, description: 'Basic benefits', benefits: ['Logo placement'] }
                        ],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    } as Event);
                }
            } catch (error) {
                console.error('Unexpected error in fetchEvent', error);
            } finally {
                setIsLoading(false);
            }
            setUser(getUser());
        };

        fetchEvent();
    }, [eventId]);

    if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-12">Loading...</div>;
    if (!event) return <div className="max-w-7xl mx-auto px-4 py-12">Event not found</div>;

    const isSponsor = user?.role === 'sponsor';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link href="/events" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
                &larr; Back to Events
            </Link>

            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100">
                        <div className="h-64 bg-gray-200 w-full object-cover flex items-center justify-center text-gray-500 text-xl font-medium">
                            Hero Image for Event {event._id || event.id}
                        </div>
                        <div className="px-4 py-5 sm:px-6">
                            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Organized by {event.organizerId === '65bd1a2b3c4d5e6f7a8b9c0d' ? 'TechInc' : `Organizer #${event.organizerId?.slice(-4) || 'Unknown'}`}
                            </p>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{new Date(event.startDate).toLocaleDateString()}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{event.location}</dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">About</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {event.description}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <div className="bg-white shadow sm:rounded-lg px-4 py-5 sm:px-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Sponsorship Packages</h2>
                        <div className="space-y-4">
                            {event.sponsorshipTiers?.map((tier) => (
                                <div key={tier.id} className="border border-gray-200 rounded-md p-4 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{tier.name} Package - ${tier.amount.toLocaleString()}</h3>
                                        <p className="text-sm text-gray-500">{tier.description}</p>
                                    </div>
                                    <Button variant="outline" className="text-sm">View Details</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 mt-8 lg:mt-0 space-y-6">
                    <Card title="Event Stats">
                        <dl className="space-y-4">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Expected Attendees</dt>
                                <dd className="font-medium text-gray-900">5,000+</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Amount Required</dt>
                                <dd className="font-medium text-gray-900">${(event.amountRequired ?? 0).toLocaleString()}</dd>
                            </div>
                        </dl>
                        <div className="mt-6">
                            {isSponsor ? (
                                <Button onClick={() => setIsModalOpen(true)} className="w-full">
                                    Ask for Sponsorship
                                </Button>
                            ) : !isAuthenticated() ? (
                                <Link href="/login">
                                    <Button className="w-full">Login to Sponsor</Button>
                                </Link>
                            ) : (
                                <Button className="w-full" disabled>Contact Organizer</Button>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <OrganizerListModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                eventId={event._id || event.id}
                eventTitle={event.title}
            />
        </div>
    );
}
