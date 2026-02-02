'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { sponsorshipService } from '@/services/sponsorshipService';
import { eventService } from '@/services/event.service';
import { Event } from '@/types/event';
import { User } from '@/types/user';
import { Loader2, Send, Calendar } from 'lucide-react';

interface InviteSponsorModalProps {
    isOpen: boolean;
    onClose: () => void;
    sponsor: User | null;
}

export const InviteSponsorModal: React.FC<InviteSponsorModalProps> = ({
    isOpen,
    onClose,
    sponsor
}) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [message, setMessage] = useState('');
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchEvents();
            setSuccess(false);
            setError('');
            setMessage('');
            setSelectedEventId('');
        }
    }, [isOpen]);

    const fetchEvents = async () => {
        try {
            setIsLoadingEvents(true);
            const data = await eventService.getMyEvents();
            setEvents(data);
            if (data.length > 0) {
                // Find first event with _id or id
                const firstEvent = data[0];
                setSelectedEventId(firstEvent._id || firstEvent.id);
            }
        } catch (err) {
            console.error('Failed to fetch events', err);
            setError('Could not load your events. Please try again.');
        } finally {
            setIsLoadingEvents(false);
        }
    };

    const handleInvite = async () => {
        if (!selectedEventId) {
            setError('Please select an event');
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');
            const sId = sponsor?._id || sponsor?.id;
            if (!sId) throw new Error('Invalid sponsor ID');

            await sponsorshipService.inviteSponsor(selectedEventId, sId, message);
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to send invitation');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Invite ${sponsor?.name}`}>
            <div className="space-y-6 py-4">
                {success ? (
                    <div className="p-8 text-center space-y-4">
                        <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                            <Send className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Invitation Sent!</h3>
                        <p className="text-sm text-gray-500">Your request has been delivered to {sponsor?.organizationName || sponsor?.name}.</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Target Event</label>
                            {isLoadingEvents ? (
                                <div className="h-12 w-full bg-gray-50 animate-pulse rounded-xl"></div>
                            ) : events.length === 0 ? (
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs font-bold uppercase tracking-tight">
                                    No active events found. Create an event first to invite sponsors.
                                </div>
                            ) : (
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <select
                                        value={selectedEventId}
                                        onChange={(e) => setSelectedEventId(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-[10px] uppercase tracking-widest appearance-none"
                                    >
                                        {events.map((event) => (
                                            <option key={event._id || event.id} value={event._id || event.id}>
                                                {event.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Proposal Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Elevate your pitch. What makes this collaboration a high-impact match?"
                                className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[2rem] outline-none transition-all font-bold text-[10px] uppercase tracking-widest min-h-[160px] resize-none"
                            />
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right italic">
                                💡 Tip: Be specific about the ROI and visibility.
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[10px] font-black uppercase tracking-widest">
                                {error}
                            </div>
                        )}

                        <div className="pt-4 flex gap-4">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 py-5 rounded-2xl border-2 border-gray-100 font-black uppercase tracking-widest text-[10px] hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleInvite}
                                disabled={isSubmitting || events.length === 0}
                                className="flex-1 py-5 rounded-2xl bg-gray-900 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/10 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Send Invitation"}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};
