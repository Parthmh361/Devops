import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Mock data
const EVENTS = [
    { id: 1, title: 'Tech Start Competition 2026', date: '2026-06-15', location: 'San Francisco, CA', category: 'Technology' },
    { id: 2, title: 'Green Earth Summit', date: '2026-07-22', location: 'Austin, TX', category: 'Environment' },
    { id: 3, title: 'Music & Arts Festival', date: '2026-08-30', location: 'New York, NY', category: 'Arts' },
];

export default function EventsPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Browse Events</h1>
                <div className="flex space-x-4">
                    {/* Filters placeholder */}
                    <Button variant="outline">Filter</Button>
                    <Button variant="outline">Sort</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {EVENTS.map((event) => (
                    <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300">
                        <div className="h-48 bg-gray-200 mb-4 rounded-md flex items-center justify-center text-gray-400">
                            Event Image
                        </div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {event.category}
                            </span>
                            <span className="text-sm text-gray-500">{event.date}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                        <p className="text-gray-500 mb-4 text-sm">{event.location}</p>
                        <Link href={`/events/${event.id}`}>
                            <Button className="w-full">View Details</Button>
                        </Link>
                    </Card>
                ))}
            </div>
        </div>
    );
}
