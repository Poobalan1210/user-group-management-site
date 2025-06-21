<script setup lang="ts">
import { ref, computed } from 'vue';
import { events } from '../data/events';
import type { Event } from '../data/events';
import EventCard from '../components/EventCard.vue';
import EventForm from '../components/EventForm.vue';

const showCreateForm = ref(false);
const localEvents = ref([...events]);
const eventTypeToCreate = ref<'builders_skill_sprint' | 'virtual_event'>('builders_skill_sprint');
const eventToEdit = ref<Event | undefined>(undefined);

const liveEvents = computed(() => {
  return localEvents.value.filter(event => event.status === 'live');
});

const pastEvents = computed(() => {
  return localEvents.value.filter(event => event.status === 'past');
});

const handleCreateEvent = (newEvent: Event) => {
  localEvents.value.unshift(newEvent);
  showCreateForm.value = false;
  document.body.style.overflow = "";
};

const handleUpdateEvent = (updatedEvent: Event) => {
  const index = localEvents.value.findIndex(event => event.id === updatedEvent.id);
  if (index !== -1) {
    localEvents.value[index] = updatedEvent;
  }
  showCreateForm.value = false;
  eventToEdit.value = undefined;
  document.body.style.overflow = "";
};

const handleEditEvent = (event: Event) => {
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
      <div class="flex gap-2">
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

    <!-- Live Events Section -->
    <div class="mb-8">
      <div class="flex items-center mb-4">
        <UIcon name="i-heroicons-bolt" class="text-yellow-500 mr-2" />
        <h2 class="text-xl font-semibold">Live Events</h2>
      </div>
      
      <div v-if="liveEvents.length > 0" class="space-y-4">
        <EventCard 
          v-for="event in liveEvents" 
          :key="event.id" 
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
      
      <div v-if="pastEvents.length > 0" class="space-y-4">
        <EventCard 
          v-for="event in pastEvents" 
          :key="event.id" 
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