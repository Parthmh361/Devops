export type EventCategory = 'Technology' | 'Business' | 'Music' | 'Art' | 'Sports' | 'Other';
export type EventMode = 'online' | 'offline' | 'hybrid';
export type EventStatus = 'Draft' | 'Published' | 'Cancelled' | 'Completed';

export interface SponsorshipTier {
    id: string;
    name: string;
    amount: number;
    description: string;
    benefits: string[];
}

export interface Event {
    _id: string;
    id: string;
    title: string;
    description: string;
    category: EventCategory;
    startDate: string;
    endDate: string;
    date: string; // Specific event date
    amountRequired: number; // Total sponsorship amount required
    location: string;
    eventMode: EventMode;
    status: EventStatus;
    isApproved: boolean;
    organizerId: string;
    sponsorshipTiers: SponsorshipTier[];
    bannerUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateEventPayload {
    title: string;
    description: string;
    category: EventCategory;
    startDate: string;
    endDate: string;
    date: string;
    amountRequired: number;
    location: string;
    eventMode: EventMode;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {
    status?: EventStatus;
}
