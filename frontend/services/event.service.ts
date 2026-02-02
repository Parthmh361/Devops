import api from './api';
import { Event, CreateEventPayload, UpdateEventPayload, SponsorshipTier } from '../types/event';

export const eventService = {
    getMyEvents: async (): Promise<Event[]> => {
        const response = await api.get<any>('/events/my');
        return response.data.data;
    },

    getEventById: async (id: string): Promise<Event> => {
        const response = await api.get<any>(`/events/${id}`);
        return response.data.data;
    },

    createEvent: async (payload: CreateEventPayload): Promise<Event> => {
        const response = await api.post<any>('/events', payload);
        return response.data.data;
    },

    updateEvent: async (id: string, payload: UpdateEventPayload): Promise<Event> => {
        const response = await api.put<any>(`/events/${id}`, payload);
        return response.data.data;
    },

    deleteEvent: async (id: string): Promise<void> => {
        await api.delete(`/events/${id}`);
    },

    publishEvent: async (id: string): Promise<Event> => {
        const response = await api.patch<any>(`/events/${id}/publish`);
        return response.data.data;
    },

    updateSponsorshipRequirements: async (id: string, tiers: SponsorshipTier[]): Promise<Event> => {
        const response = await api.put<any>(`/events/${id}/sponsorship-requirements`, { sponsorshipTiers: tiers });
        return response.data.data;
    },

    getAllEvents: async (params?: Record<string, any>): Promise<Event[]> => {
        const response = await api.get<any>('/events', { params });
        return response.data.data;
    },

    getPublicEvents: async (params?: Record<string, any>): Promise<{ events: Event[], total: number }> => {
        const response = await api.get<any>('/events', { params });
        const events = response.data.data || [];
        const total = response.data.pagination?.total || events.length;
        return { events, total };
    },

    getPublicEventById: async (id: string): Promise<Event | null> => {
        // Validate if id is a valid 24-char hex string (ObjectId)
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return null;
        }
        try {
            const response = await api.get<any>(`/events/${id}`);
            return response.data.data;
        } catch (error) {
            return null;
        }
    }
};
