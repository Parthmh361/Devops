'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { eventService } from '@/services/event.service';
import { Event } from '@/types/event';
import Link from 'next/link';

export default function OrganizerEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await eventService.getMyEvents();
                setEvents(data);
            } catch (error) {
                console.error('Failed to fetch events', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (isLoading) return <div>Loading events...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
                <Link href="/organizer/events/new">
                    <Button>Create New Event</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {events.length > 0 ? (
                    events.map((event) => (
                        <Card key={event._id} className="hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                                    <p className="text-sm text-gray-500">{new Date(event.startDate).toLocaleDateString()} • {event.location}</p>
                                    <div className="mt-2">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${event.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {event.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Link href={`/organizer/events/${event.id}`}>
                                        <Button variant="outline" className="text-sm">Manage</Button>
                                    </Link>
                                    <Link href={`/events/${event.id}`}>
                                        <Button variant="outline" className="text-sm">View Public</Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
                            <Link href="/organizer/events/new">
                                <Button>Create Your First Event</Button>
                            </Link>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
