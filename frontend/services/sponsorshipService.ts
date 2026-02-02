import api from './api';
import { SponsorshipRequest, Notification } from '@/types/sponsorship';
import { User } from '@/types/user';

export const sponsorshipService = {
    getEventOrganizers: async (eventId: string): Promise<User[]> => {
        // Validation for demo ID '2' or any non-ObjectId
        if (!/^[0-9a-fA-F]{24}$/.test(eventId)) {
            // Return high-fidelity mock organizer for demo consistency
            return [{
                id: '65bd1a2b3c4d5e6f7a8b9c0d',
                _id: '65bd1a2b3c4d5e6f7a8b9c0d',
                name: 'Sarah Johnson',
                organizationName: 'TechInc Global',
                email: 'sarah@techinc.com',
                role: 'organizer' as any,
                createdAt: new Date().toISOString()
            }];
        }

        try {
            const response = await api.get(`/sponsorship/event/${eventId}/organizers`);
            return response.data.data;
        } catch (error) {
            console.error('Failed to fetch organizers, usage of fallback', error);
            return [];
        }
    },

    createRequest: async (eventId: string, organizerId: string): Promise<SponsorshipRequest> => {
        // Validation for demo ID '2' or any non-ObjectId
        if (!/^[0-9a-fA-F]{24}$/.test(eventId) || !/^[0-9a-fA-F]{24}$/.test(organizerId)) {
            // Simulate successful request for demo
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        id: 'mock-request-' + Date.now(),
                        eventId,
                        organizerId,
                        sponsorId: 'current-user-id',
                        status: 'pending',
                        createdAt: new Date().toISOString()
                    } as any);
                }, 1000);
            });
        }

        try {
            const response = await api.post('/sponsorship/request', { eventId, organizerId });
            return response.data.data;
        } catch (error: any) {
            throw error;
        }
    },

    getOrganizerRequests: async (): Promise<SponsorshipRequest[]> => {
        const response = await api.get('/sponsorship/organizer/requests');
        return response.data.data;
    },

    acceptRequest: async (requestId: string): Promise<SponsorshipRequest> => {
        const response = await api.patch(`/sponsorship/request/${requestId}/accept`);
        return response.data.data;
    },

    rejectRequest: async (requestId: string): Promise<SponsorshipRequest> => {
        const response = await api.patch(`/sponsorship/request/${requestId}/reject`);
        return response.data.data;
    },

    getNotifications: async (): Promise<Notification[]> => {
        const response = await api.get('/notifications');
        return response.data.data;
    },

    getAllSponsors: async (): Promise<User[]> => {
        const response = await api.get('/sponsorship/sponsors');
        return response.data.data;
    },

    inviteSponsor: async (eventId: string, sponsorId: string, message?: string): Promise<SponsorshipRequest> => {
        const response = await api.post('/sponsorship/request/invite', { eventId, sponsorId, message });
        return response.data.data;
    },

    getSponsorRequests: async (): Promise<SponsorshipRequest[]> => {
        const response = await api.get('/sponsorship/sponsor/requests');
        return response.data.data;
    }
};
