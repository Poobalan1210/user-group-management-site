import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Event } from '../data/events';
import { events as localEvents } from '../data/events';
import { EventService } from '../services/eventService';

export const useEventStore = defineStore('events', () => {
  const events = ref<Event[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const lastFetch = ref<number | null>(null);
  
  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  const liveEvents = computed(() => 
    events.value.filter(event => event.status === 'live')
  );

  const pastEvents = computed(() => 
    events.value.filter(event => event.status === 'past')
  );

  const shouldRefetch = computed(() => {
    if (!lastFetch.value) return true;
    return Date.now() - lastFetch.value > CACHE_DURATION;
  });

  async function fetchEvents(force = false) {
    if (!force && !shouldRefetch.value && events.value.length > 0) {
      return events.value;
    }

    try {
      isLoading.value = true;
      error.value = null;
      
      // Try to fetch from API first
      try {
        const apiEvents = await EventService.getAllEvents();
        
        events.value = apiEvents;
        lastFetch.value = Date.now();
        return apiEvents;
      } catch (apiError) {
        console.warn('API not available, using local events data:', apiError);
        
        // Fallback to local events data
        events.value = localEvents;
        lastFetch.value = Date.now();
        return localEvents;
      }
    } catch (err) {
      console.error('Error loading events:', err);
      error.value = 'Failed to load events';
      
      // Even if there's an error, try to use local data as last resort
      if (events.value.length === 0) {
        events.value = localEvents;
      }
      
      return events.value;
    } finally {
      isLoading.value = false;
    }
  }

  async function createEvent(newEvent: Event) {
    const createdEvent = await EventService.createEvent(newEvent);
    events.value.unshift(createdEvent);
    return createdEvent;
  }

  async function updateEvent(eventId: string, updatedEvent: Event) {
    const actualEventId = eventId || updatedEvent.eventId;
    if (!actualEventId) {
      throw new Error('No valid event ID provided for update');
    }
    
    const updated = await EventService.updateEvent(actualEventId, updatedEvent);
    const index = events.value.findIndex(event => 
      event.eventId === actualEventId
    );
    if (index !== -1) {
      events.value[index] = updated;
    }
    return updated;
  }

  function clearCache() {
    events.value = [];
    lastFetch.value = null;
    error.value = null;
  }

  return {
    events,
    isLoading,
    error,
    liveEvents,
    pastEvents,
    fetchEvents,
    createEvent,
    updateEvent,
    clearCache
  };
});