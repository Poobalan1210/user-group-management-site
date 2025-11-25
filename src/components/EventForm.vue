<script setup lang="ts">
import { ref, reactive, watch, computed, onUnmounted } from "vue";
import type { Checkpoint, Resource, Event } from "../data/events";
import { getFormSchemaOptions } from "../data/formSchemas";
import RichTextEditor from './RichTextEditor.vue';
import ImageUpload from './ImageUpload.vue';

const currentStep = ref(1);

const props = defineProps<{
  isOpen: boolean;
  defaultEventType?: 'builders_skill_sprint' | 'virtual_event';
  eventToEdit?: Event;
}>();

const emit = defineEmits<{
  (e: "event-created", event: Event): void;
  (e: "event-updated", event: Event): void;
  (e: "cancel"): void;
}>();

// Check if we're in edit mode
const isEditMode = computed(() => !!props.eventToEdit);

// Initialize the form with the event to edit or with default values
const initializeForm = () => {
  if (props.eventToEdit) {
    // For virtual events, get media from first checkpoint if available
    let posterImage = props.eventToEdit.posterImage || "";
    let youtubeVideoId = props.eventToEdit.youtubeVideoId || "";
    
    // If it's a virtual event, check if media exists in the first checkpoint
    if (props.eventToEdit.eventType === 'virtual_event' && 
        props.eventToEdit.checkpoints && 
        props.eventToEdit.checkpoints.length > 0) {
      posterImage = posterImage || props.eventToEdit.checkpoints[0].posterImage || "";
      youtubeVideoId = youtubeVideoId || props.eventToEdit.checkpoints[0].youtubeVideoId || "";
    }
    
    // Clone the event to edit
    return {
      title: props.eventToEdit.title,
      description: props.eventToEdit.description,
      status: props.eventToEdit.status,
      date: props.eventToEdit.date,
      eventType: props.eventToEdit.eventType,
      tags: [...(props.eventToEdit.tags || [])],
      challengeFormSchema: props.eventToEdit.challengeFormSchema || "",
      meetupLink: props.eventToEdit.meetupLink || "",
      checkpoints: props.eventToEdit.checkpoints.map(cp => ({ ...cp })),
      resources: props.eventToEdit.resources.map(res => ({ ...res })),
      posterImage,
      youtubeVideoId,
    } as Omit<Event, "eventId">;
  }
  
  // Default values for new event
  return {
    title: "",
    description: "",
    status: "live" as const,
    date: new Date().toISOString().split("T")[0],
    eventType: (props.defaultEventType || "builders_skill_sprint") as "builders_skill_sprint" | "virtual_event",
    tags: [],
    challengeFormLink: "",
    challengeFormSchema: "",
    meetupLink: "",
    checkpoints: [],
    resources: [],
    posterImage: "",
    youtubeVideoId: "",
  } as Omit<Event, "eventId">;
};

const newEvent = reactive<Omit<Event, "eventId">>(initializeForm());

// Watch for changes to isOpen prop
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
      
      // Reset form when opening
      const formValues = initializeForm();
      Object.keys(formValues).forEach(key => {
        // @ts-ignore
        newEvent[key] = formValues[key];
      });
    } else {
      document.body.style.overflow = "auto"; // Restore scrolling when modal is closed
    }
  },
  { immediate: true } // Run immediately to ensure proper initial state
);

// Watch for changes to eventToEdit prop to update form when editing
watch(
  () => props.eventToEdit,
  (eventToEdit) => {
    if (eventToEdit && props.isOpen) {
      const formValues = initializeForm();
      
      // Debug logging for virtual events
      if (eventToEdit.eventType === 'virtual_event') {
        console.log('Editing virtual event:', eventToEdit.title);
        console.log('Event poster image:', eventToEdit.posterImage);
        console.log('Event YouTube ID:', eventToEdit.youtubeVideoId);
        
        if (eventToEdit.checkpoints && eventToEdit.checkpoints.length > 0) {
          console.log('First checkpoint poster:', eventToEdit.checkpoints[0].posterImage);
          console.log('First checkpoint YouTube:', eventToEdit.checkpoints[0].youtubeVideoId);
        }
        
        console.log('Form values poster:', formValues.posterImage);
        console.log('Form values YouTube:', formValues.youtubeVideoId);
      }
      
      Object.keys(formValues).forEach(key => {
        // @ts-ignore
        newEvent[key] = formValues[key];
      });
    }
  },
  { immediate: true }
);

// Make sure scrolling is restored when component is unmounted
onUnmounted(() => {
  document.body.style.overflow = "auto"; // Restore scrolling
});

const newCheckpoint = reactive<Checkpoint>({
  title: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
  meetupUrl: "",
  posterImage: "",
  youtubeVideoId: "",
});

const newResource = reactive<Resource>({
  title: "",
  link: "",
  type: "document",
});

// Predefined tag options
const tagOptions = [
  { label: "AWS", value: "aws" },
  { label: "Serverless", value: "serverless" },
  { label: "Frontend", value: "frontend" },
  { label: "Backend", value: "backend" },
  { label: "Full Stack", value: "full-stack" },
  { label: "DevOps", value: "devops" },
  { label: "Machine Learning", value: "ml" },
  { label: "Blockchain", value: "blockchain" },
];

const resourceTypeOptions = [
  { label: "Document", value: "document" },
  { label: "Video", value: "video" },
  { label: "Code", value: "code" },
  { label: "Other", value: "other" },
];

const formSchemaOptions = getFormSchemaOptions();

const statusOptions = [
  { label: "Live", value: "live" },
  { label: "Past", value: "past" },
];

const selectedTag = ref("");

const addTag = () => {
  if (selectedTag.value && !newEvent.tags?.includes(selectedTag.value)) {
    if (!newEvent.tags) {
      newEvent.tags = [];
    }
    newEvent.tags.push(selectedTag.value);
    selectedTag.value = "";
  }
};

const removeTag = (index: number) => {
  if (newEvent.tags) {
    newEvent.tags.splice(index, 1);
  }
};

// Watch for changes to event type
watch(
  () => newEvent.eventType,
  (newType) => {
    if (newType === "virtual_event") {
      // For virtual events, ensure we have at least one checkpoint to store media
      if (newEvent.checkpoints.length === 0) {
        newEvent.checkpoints = [{
          title: "Virtual Event",
          date: newEvent.date,
          description: "Virtual event details",
          posterImage: newEvent.posterImage || "",
          youtubeVideoId: newEvent.youtubeVideoId || ""
        }];
      }
      newEvent.challengeFormSchema = "";
    } else if (newType === "builders_skill_sprint") {
      // Clear meetup link for builders skill sprint (only checkpoints have meetup links)
      newEvent.meetupLink = "";
    }
  }
);

// Helper computed property for button color based on event type
const buttonColor = computed(() => {
  return newEvent.eventType === 'virtual_event' ? 'info' : 'primary';
});

const addCheckpoint = () => {
  if (newCheckpoint.title && newCheckpoint.description) {
    newEvent.checkpoints.push({ ...newCheckpoint });
    // Reset form
    newCheckpoint.title = "";
    newCheckpoint.description = "";
    newCheckpoint.date = new Date().toISOString().split("T")[0];
    newCheckpoint.meetupUrl = "";
    newCheckpoint.posterImage = "";
    newCheckpoint.youtubeVideoId = "";
  }
};

const removeCheckpoint = (index: number) => {
  newEvent.checkpoints.splice(index, 1);
};

const addResource = () => {
  if (newResource.title && newResource.link) {
    newEvent.resources.push({ ...newResource });
    // Reset form
    newResource.title = "";
    newResource.link = "";
    newResource.type = "document";
  }
};

const removeResource = (index: number) => {
  newEvent.resources.splice(index, 1);
};

const submitForm = () => {
  if (newEvent.title && newEvent.description && newEvent.date) {
    // For virtual events, ensure media is stored in checkpoint
    if (newEvent.eventType === "virtual_event") {
      console.log('Submitting virtual event with poster:', newEvent.posterImage);
      console.log('Submitting virtual event with YouTube ID:', newEvent.youtubeVideoId);
      
      // Create or update the first checkpoint with the media information
      if (newEvent.checkpoints.length === 0) {
        newEvent.checkpoints = [{
          title: "Virtual Event",
          date: newEvent.date,
          description: "Virtual event details",
          posterImage: newEvent.posterImage || "",
          youtubeVideoId: newEvent.youtubeVideoId || ""
        }];
      } else {
        // Update the first checkpoint with current media values
        newEvent.checkpoints[0].posterImage = newEvent.posterImage || "";
        newEvent.checkpoints[0].youtubeVideoId = newEvent.youtubeVideoId || "";
      }
      
      console.log('Updated checkpoint poster:', newEvent.checkpoints[0].posterImage);
      console.log('Updated checkpoint YouTube ID:', newEvent.checkpoints[0].youtubeVideoId);
    }
    
    if (isEditMode.value) {
      // Update existing event
      const updatedEvent: Event = {
        ...props.eventToEdit!,
        ...newEvent,
      };
      
      // For virtual events, ensure we're not losing checkpoint data
      if (updatedEvent.eventType === 'virtual_event' && updatedEvent.checkpoints && updatedEvent.checkpoints.length > 0) {
        console.log('Final checkpoint data before update:', updatedEvent.checkpoints[0]);
      }
      
      document.body.style.overflow = "auto"; // Restore scrolling before emitting
      emit("event-updated", updatedEvent);
    } else {
      // Create new event
      const createdEvent: Event = {
        ...newEvent,
        eventId: Date.now().toString(),
      };
      
      // For virtual events, ensure we're not losing checkpoint data
      if (createdEvent.eventType === 'virtual_event' && createdEvent.checkpoints && createdEvent.checkpoints.length > 0) {
        console.log('Final checkpoint data before creation:', createdEvent.checkpoints[0]);
      }
      
      document.body.style.overflow = "auto"; // Restore scrolling before emitting
      emit("event-created", createdEvent);
    }
  }
};

const cancel = () => {
  document.body.style.overflow = "auto"; // Ensure scrolling is restored
  emit("cancel");
};

const handleModalClose = () => {
  document.body.style.overflow = "auto";
  emit("cancel");
};

const isStep1Valid = computed(() => {
  return newEvent.title && newEvent.description && newEvent.date;
});

const isStep2Valid = computed(() => {
  if (newEvent.eventType === 'virtual_event') {
    return true;
  }
  return true;
});

const isStep3Valid = computed(() => {
  if (newEvent.eventType === 'builders_skill_sprint') {
    return newEvent.checkpoints.length > 0;
  }
  return true;
});

const goToStep = (step: number) => {
  currentStep.value = step;
};

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const steps = [
  { number: 1, title: 'Basic Info', icon: 'i-heroicons-information-circle' },
  { number: 2, title: 'Details', icon: 'i-heroicons-document' },
  { number: 3, title: 'Checkpoints & Media', icon: 'i-heroicons-flag' },
  { number: 4, title: 'Resources', icon: 'i-heroicons-book-open' }
];
</script>

<template>
  <UModal
    :open="isOpen"
    @update:open="handleModalClose"
    :close="{ onClick: cancel }"
    size="2xl"
    class="z-50"
  >
    <template #title>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-xl font-bold">
          {{ isEditMode ? `Edit ${newEvent.eventType === 'virtual_event' ? 'Virtual Event' : 'Skill Sprint'}` : `Create ${newEvent.eventType === 'virtual_event' ? 'Virtual Event' : 'Skill Sprint'}` }}
        </h3>
        <span class="text-sm text-gray-500">Step {{ currentStep }} of 4</span>
      </div>
    </template>

    <template #body>
      <div class="bg-dark text-white">
        <!-- Step Indicator -->
        <div class="px-6 pt-4 pb-6 border-b border-gray-700">
          <div class="flex items-center justify-between gap-2">
            <button
              v-for="step in steps"
              :key="step.number"
              @click="goToStep(step.number)"
              class="flex flex-col items-center gap-1 flex-1"
              :class="currentStep >= step.number ? '' : 'opacity-50'"
            >
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all"
                :class="currentStep === step.number
                  ? 'bg-primary-500 text-white ring-2 ring-primary-300'
                  : currentStep > step.number
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-700 text-gray-300'"
              >
                <UIcon v-if="currentStep > step.number" name="i-heroicons-check" />
                <span v-else>{{ step.number }}</span>
              </div>
              <span class="text-xs text-center text-gray-400">{{ step.title }}</span>
            </button>
          </div>
        </div>

        <!-- Form Steps -->
        <div class="px-6 py-6 max-h-[60vh] overflow-y-auto">
          <form @submit.prevent="submitForm">
            <!-- Step 1: Basic Info -->
            <div v-if="currentStep === 1" class="space-y-6 animate-fadeIn">
              <div>
                <label class="block text-sm font-semibold mb-2 text-white">Event Title</label>
                <UInput
                  v-model="newEvent.title"
                  placeholder="Enter event title"
                  class="w-full dark-input"
                  size="lg"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold mb-2 text-white">Description</label>
                <RichTextEditor
                  v-model="newEvent.description"
                  placeholder="Describe your event. Use **bold**, *italic*, • bullets, [links](url)"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold mb-2 text-white">Event Date</label>
                  <UInput
                    v-model="newEvent.date"
                    type="date"
                    class="w-full dark-input"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-2 text-white">Status</label>
                  <USelect
                    v-model="newEvent.status"
                    :items="statusOptions"
                    class="w-full dark-select"
                  />
                </div>
              </div>
            </div>

            <!-- Step 2: Details & Tags -->
            <div v-if="currentStep === 2" class="space-y-6 animate-fadeIn">
              <div>
                <label class="block text-sm font-semibold mb-3 text-white">Tags</label>
                <div class="flex flex-wrap gap-2 mb-4">
                  <UBadge
                    v-for="(tag, index) in newEvent.tags || []"
                    :key="index"
                    :color="newEvent.eventType === 'virtual_event' ? 'info' : 'primary'"
                    class="flex items-center gap-1"
                  >
                    {{ tagOptions.find((t) => t.value === tag)?.label || tag }}
                    <UButton
                      size="xs"
                      icon="i-heroicons-x-mark"
                      class="ml-1"
                      :color="newEvent.eventType === 'virtual_event' ? 'info' : 'primary'"
                      variant="ghost"
                      @click="removeTag(index)"
                    />
                  </UBadge>
                </div>
                <div class="flex gap-2">
                  <USelect
                    v-model="selectedTag"
                    :items="tagOptions"
                    placeholder="Select a tag"
                    class="flex-grow dark-select"
                  />
                  <UButton @click="addTag" :disabled="!selectedTag" :color="buttonColor" icon="i-heroicons-plus">
                    Add
                  </UButton>
                </div>
              </div>

              <div v-if="newEvent.eventType === 'builders_skill_sprint'">
                <label class="block text-sm font-semibold mb-2 text-white">Challenge Form Schema</label>
                <USelect
                  v-model="newEvent.challengeFormSchema"
                  :items="formSchemaOptions"
                  placeholder="Select form schema for submissions"
                  class="w-full dark-select"
                />
              </div>

              <div v-if="newEvent.eventType === 'virtual_event'">
                <label class="block text-sm font-semibold mb-2 text-white">Meetup URL</label>
                <UInput
                  v-model="newEvent.meetupLink"
                  placeholder="https://meetup.com/..."
                  class="w-full dark-input"
                />
              </div>
            </div>

            <!-- Step 3: Checkpoints & Media -->
            <div v-if="currentStep === 3" class="space-y-6 animate-fadeIn">
              <div v-if="newEvent.eventType === 'builders_skill_sprint'">
                <h4 class="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                  <UIcon name="i-heroicons-flag" />
                  Checkpoints ({{ newEvent.checkpoints.length }})
                </h4>

                <div v-if="newEvent.checkpoints.length > 0" class="space-y-3 mb-6">
                  <div
                    v-for="(checkpoint, index) in newEvent.checkpoints"
                    :key="index"
                    class="p-3 border border-gray-700 rounded-lg bg-gray-800 flex justify-between items-start"
                  >
                    <div>
                      <p class="font-medium text-white">{{ checkpoint.title }}</p>
                      <p class="text-sm text-gray-400">{{ checkpoint.date }}</p>
                    </div>
                    <UButton
                      color="primary"
                      variant="ghost"
                      icon="i-heroicons-trash"
                      size="xs"
                      @click="removeCheckpoint(index)"
                    />
                  </div>
                </div>

                <div class="border border-gray-700 rounded-lg p-4 bg-gray-800 space-y-4">
                  <h5 class="font-medium text-white">Add Checkpoint</h5>
                  <UInput
                    v-model="newCheckpoint.title"
                    placeholder="Checkpoint title"
                    class="w-full dark-input"
                  />
                  <UInput
                    v-model="newCheckpoint.date"
                    type="date"
                    class="w-full dark-input"
                  />
                  <RichTextEditor
                    v-model="newCheckpoint.description"
                    placeholder="Checkpoint description"
                  />
                  <UInput
                    v-model="newCheckpoint.meetupUrl"
                    placeholder="Meetup URL (optional)"
                    class="w-full dark-input"
                  />
                  <UButton
                    block
                    :color="buttonColor"
                    @click="addCheckpoint"
                    :disabled="!newCheckpoint.title || !newCheckpoint.description"
                    icon="i-heroicons-plus"
                  >
                    Add Checkpoint
                  </UButton>
                </div>
              </div>

              <div v-if="newEvent.eventType === 'virtual_event'" class="space-y-4">
                <h4 class="text-lg font-semibold text-white flex items-center gap-2">
                  <UIcon name="i-heroicons-photo" />
                  Event Media
                </h4>
                <div>
                  <label class="block text-sm font-medium mb-2 text-white">Poster Image</label>
                  <ImageUpload
                    v-model="newEvent.posterImage"
                    placeholder="Upload poster image"
                    :folder="`events/${newEvent.title ? newEvent.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : 'untitled'}`"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2 text-white">YouTube Video ID</label>
                  <UInput
                    v-model="newEvent.youtubeVideoId"
                    placeholder="e.g., dQw4w9WgXcQ"
                    class="w-full dark-input"
                  />
                </div>
              </div>
            </div>

            <!-- Step 4: Resources -->
            <div v-if="currentStep === 4" class="space-y-6 animate-fadeIn">
              <h4 class="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                <UIcon name="i-heroicons-book-open" />
                Resources ({{ newEvent.resources.length }})
              </h4>

              <div v-if="newEvent.resources.length > 0" class="space-y-3 mb-6">
                <div
                  v-for="(resource, index) in newEvent.resources"
                  :key="index"
                  class="p-3 border border-gray-700 rounded-lg bg-gray-800 flex justify-between items-start"
                >
                  <div class="flex-1">
                    <p class="font-medium text-white">{{ resource.title }}</p>
                    <p class="text-xs text-gray-400 truncate">{{ resource.link }}</p>
                  </div>
                  <UButton
                    color="primary"
                    variant="ghost"
                    icon="i-heroicons-trash"
                    size="xs"
                    @click="removeResource(index)"
                  />
                </div>
              </div>

              <div class="border border-gray-700 rounded-lg p-4 bg-gray-800 space-y-4">
                <h5 class="font-medium text-white">Add Resource</h5>
                <UInput
                  v-model="newResource.title"
                  placeholder="Resource title"
                  class="w-full dark-input"
                />
                <UInput
                  v-model="newResource.link"
                  placeholder="https://..."
                  class="w-full dark-input"
                />
                <USelect
                  v-model="newResource.type"
                  :items="resourceTypeOptions"
                  class="w-full dark-select"
                />
                <UButton
                  block
                  :color="buttonColor"
                  @click="addResource"
                  :disabled="!newResource.title || !newResource.link"
                  icon="i-heroicons-plus"
                >
                  Add Resource
                </UButton>
              </div>
            </div>
          </form>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between gap-2 p-4 bg-dark text-white border-t border-gray-700">
        <div class="flex gap-2">
          <UButton v-if="currentStep > 1" variant="outline" color="neutral" @click="prevStep">
            Previous
          </UButton>
        </div>
        <div class="flex gap-2 ml-auto">
          <UButton variant="outline" color="neutral" @click="cancel">
            Cancel
          </UButton>
          <UButton
            v-if="currentStep < 4"
            :color="buttonColor"
            @click="nextStep"
            icon="i-heroicons-arrow-right"
          >
            Next
          </UButton>
          <UButton
            v-else
            :color="buttonColor"
            @click="submitForm"
            icon="i-heroicons-check"
          >
            {{ isEditMode ? 'Update' : 'Create' }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

/* Dark mode input styles */
:deep(.dark-select .u-select__input) {
  background-color: #1e293b !important;
  border-color: #334155 !important;
  color: white !important;
}

:deep(.dark-select .u-select__placeholder) {
  color: #94a3b8 !important;
}

:deep(.dark-select .u-select__dropdown) {
  background-color: #1e293b !important;
  border-color: #334155 !important;
  color: white !important;
}

:deep(.dark-input) {
  background-color: #1e293b !important;
  border-color: #334155 !important;
  color: white !important;
}

:deep(.dark-input::placeholder) {
  color: #94a3b8 !important;
}

:deep(.u-form-group label) {
  color: white !important;
}

:deep(.u-form-group__help) {
  color: #94a3b8 !important;
}

.bg-dark {
  background-color: #0f172a !important;
  color: white;
}

.bg-gray-800 {
  background-color: #1e293b !important;
}

.border-gray-700 {
  border-color: #334155 !important;
}
</style>
