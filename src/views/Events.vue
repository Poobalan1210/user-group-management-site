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
    <div v-if="eventStore.isLoading" class="flex flex-col items-center justify-center h-64">
      <UIcon name="i-heroicons-arrow-path" class="text-4xl animate-spin mb-4" />
      <span class="text-sm text-gray-600">Loading events...</span>
    </div>
    <div v-else class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Events</h1>
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

    <div v-if="!eventStore.isLoading">
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
      <div class="mb-12">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-yellow-100 dark:bg-yellow-950 rounded-lg">
            <UIcon name="i-heroicons-bolt" class="text-yellow-600 dark:text-yellow-400 text-lg" />
          </div>
          <div>
            <h2 class="text-2xl font-bold">Live Events</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ eventStore.liveEvents.length }} active</p>
          </div>
        </div>

        <div v-if="eventStore.liveEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EventCard
            v-for="event in eventStore.liveEvents"
            :key="event.eventId"
            :event="event"
            @edit="handleEditEvent"
          />
        </div>
        <UAlert v-else icon="i-heroicons-calendar" title="No Live Events" color="primary">
          <template #description>There are no live events at the moment. Check back soon!</template>
        </UAlert>
      </div>

      <!-- Past Events Section -->
      <div>
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <UIcon name="i-heroicons-clock" class="text-gray-600 dark:text-gray-300 text-lg" />
          </div>
          <div>
            <h2 class="text-2xl font-bold">Past Events</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ eventStore.pastEvents.length }} completed</p>
          </div>
        </div>

        <div v-if="eventStore.pastEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EventCard
            v-for="event in eventStore.pastEvents"
            :key="event.eventId"
            :event="event"
            @edit="handleEditEvent"
          />
        </div>
        <UAlert v-else icon="i-heroicons-archive-box" title="No Past Events" color="primary">
          <template #description>You haven't completed any events yet.</template>
        </UAlert>
      </div>
    </div>
  </div>
</template> 