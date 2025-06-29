<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Event } from '../data/events';
import EventCard from '../components/EventCard.vue';
import EventForm from '../components/EventForm.vue';
import { useEventStore } from '../stores/eventStore';
import { useAdmin } from '../composables/useAdmin';

const { isAdmin } = useAdmin();
const eventStore = useEventStore();

const showCreateForm = ref(false);
const eventTypeToCreate = ref<'builders_skill_sprint' | 'virtual_event'>('builders_skill_sprint');
const eventToEdit = ref<Event | undefined>(undefined);

// Load events on component mount (uses cache if available)
onMounted(() => {
  eventStore.fetchEvents();
});

const handleCreateEvent = async (newEvent: Event) => {
  try {
    await eventStore.createEvent(newEvent);
    showCreateForm.value = false;
    document.body.style.overflow = "";
  } catch (error) {
    console.error('Error creating event:', error);
    alert('Failed to create event. Please try again.');
  }
};

const handleUpdateEvent = async (updatedEvent: Event) => {
  try {
    const eventId = eventToEdit.value?.eventId || updatedEvent.eventId;
    if (!eventId) {
      throw new Error('No valid event ID found for update');
    }
    
    await eventStore.updateEvent(eventId, updatedEvent);
    showCreateForm.value = false;
    eventToEdit.value = undefined;
    document.body.style.overflow = "auto";
  } catch (error) {
    console.error('Error updating event:', error);
    alert('Failed to update event. Please try again.');
  }
};

const handleEditEvent = (event: Event) => {
  console.log('Editing event:', event);
  console.log('Event ID:', event.eventId);
  eventToEdit.value = event;
  showCreateForm.value = true;
};

const cancelCreate = () => {
  showCreateForm.value = false;
  eventToEdit.value = undefined;
  document.body.style.overflow = "";
};

const openCreateForm = (type: 'builders_skill_sprint' | 'virtual_event') => {
  eventTypeToCreate.value = type;
  eventToEdit.value = undefined;
  showCreateForm.value = true;
};
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Events</h1>
      <div v-if="eventStore.isLoading" class="flex items-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
        <span class="text-sm text-gray-600">Loading events...</span>
      </div>
      <div v-if="isAdmin" class="flex gap-2">
        <UButton color="primary" @click="openCreateForm('builders_skill_sprint')">
          <UIcon name="i-heroicons-plus" class="mr-1" />
          Create Skill Sprint
        </UButton>
        <UButton color="info" @click="openCreateForm('virtual_event')">
          <UIcon name="i-heroicons-video-camera" class="mr-1" />
          Create Virtual Event
        </UButton>
      </div>
    </div>

    <!-- Event Form Modal -->
    <EventForm 
      :is-open="showCreateForm"
      :default-event-type="eventTypeToCreate"
      :event-to-edit="eventToEdit"
      @event-created="handleCreateEvent" 
      @event-updated="handleUpdateEvent"
      @cancel="cancelCreate" 
    />

    <!-- Error Alert -->
    <UAlert v-if="eventStore.error" color="error" class="mb-6" :title="eventStore.error" />

    <!-- Live Events Section -->
    <div class="mb-8">
      <div class="flex items-center mb-4">
        <UIcon name="i-heroicons-bolt" class="text-yellow-500 mr-2" />
        <h2 class="text-xl font-semibold">Live Events</h2>
      </div>
      
      <div v-if="eventStore.liveEvents.length > 0" class="space-y-4">
        <EventCard 
          v-for="event in eventStore.liveEvents" 
          :key="event.eventId" 
          :event="event"
          @edit="handleEditEvent" 
        />
      </div>
      <UAlert v-else title="No Live Events" color="primary">
        There are no live events at the moment.
      </UAlert>
    </div>

    <!-- Past Events Section -->
    <div>
      <div class="flex items-center mb-4">
        <UIcon name="i-heroicons-clock" class="text-gray-500 mr-2" />
        <h2 class="text-xl font-semibold">Past Events</h2>
      </div>
      
      <div v-if="eventStore.pastEvents.length > 0" class="space-y-4">
        <EventCard 
          v-for="event in eventStore.pastEvents" 
          :key="event.eventId" 
          :event="event"
          @edit="handleEditEvent"
        />
      </div>
      <UAlert v-else title="No Past Events" color="primary">
        There are no past events to display.
      </UAlert>
    </div>
  </div>
</template> 