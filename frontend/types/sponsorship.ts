import { User } from './user';
import { Event } from './event';

export type SponsorshipRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface SponsorshipRequest {
    id: string;
    _id: string;
    sponsor: User;
    organizer: User;
    event: Event;
    status: SponsorshipRequestStatus;
    message?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Notification {
    id: string;
    _id: string;
    user: string;
    title: string;
    message: string;
    type: 'system' | 'proposal' | 'collaboration';
    isRead: boolean;
    relatedEntity?: {
        type: 'event' | 'proposal' | 'collaboration';
        id: string;
    };
    createdAt: string;
}
