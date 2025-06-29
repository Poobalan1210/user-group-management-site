import { apiGet, apiPost, apiPut, apiDelete } from '../api/api';
import type { Event } from '../data/events';

export interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
  status: 'live' | 'past';
  eventType: 'builders_skill_sprint' | 'virtual_event';
  tags?: string[];
  challengeFormSchema?: string;
  meetupLink?: string;
  checkpoints: any[];
  resources: any[];
  posterImage?: string;
  youtubeVideoId?: string;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  eventId: string;
}

export const EventService = {
  // Get all events
  getAllEvents: async (filters?: { status?: string, eventType?: string }): Promise<Event[]> => {
    let url = '/events';
    const queryParams = [];
    
    if (filters?.status) {
      queryParams.push(`status=${encodeURIComponent(filters.status)}`);
    }
    
    if (filters?.eventType) {
      queryParams.push(`eventType=${encodeURIComponent(filters.eventType)}`);
    }
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    return await apiGet<Event[]>(url);
  },

  // Create a new event
  createEvent: async (eventData: CreateEventRequest): Promise<Event> => {
    return await apiPost<Event>('/events', eventData);
  },

  // Update an existing event
  updateEvent: async (eventId: string, eventData: Partial<CreateEventRequest>): Promise<Event> => {
    return await apiPut<Event>(`/events/${eventId}`, eventData);
  },

  // Delete an event
  deleteEvent: async (eventId: string, date?: string): Promise<void> => {
    let url = `/events/${eventId}`;
    if (date) {
      url += `?date=${encodeURIComponent(date)}`;
    }
    return await apiDelete<void>(url);
  },

  // Get live events only
  getLiveEvents: async (): Promise<Event[]> => {
    return await EventService.getAllEvents({ status: 'live' });
  },

  // Get past events only
  getPastEvents: async (): Promise<Event[]> => {
    return await EventService.getAllEvents({ status: 'past' });
  },

  // Get events by type
  getEventsByType: async (eventType: 'builders_skill_sprint' | 'virtual_event'): Promise<Event[]> => {
    return await EventService.getAllEvents({ eventType });
  }
};