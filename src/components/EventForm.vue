<script setup lang="ts">
import { ref, reactive, watch, computed, onUnmounted } from "vue";
import type { Checkpoint, Resource, Event } from "../data/events";

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
    // Clone the event to edit
    return {
      title: props.eventToEdit.title,
      description: props.eventToEdit.description,
      status: props.eventToEdit.status,
      date: props.eventToEdit.date,
      eventType: props.eventToEdit.eventType,
      tags: [...(props.eventToEdit.tags || [])],
      challengeFormLink: props.eventToEdit.challengeFormLink || "",
      meetupLink: props.eventToEdit.meetupLink || "",
      checkpoints: props.eventToEdit.checkpoints.map(cp => ({ ...cp })),
      resources: props.eventToEdit.resources.map(res => ({ ...res })),
    } as Omit<Event, "id">;
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
    meetupLink: "",
    checkpoints: [],
    resources: [],
  } as Omit<Event, "id">;
};

const newEvent = reactive<Omit<Event, "id">>(initializeForm());

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
      document.body.style.overflow = ""; // Restore scrolling when modal is closed
    }
  },
  { immediate: true } // Run immediately to ensure proper initial state
);

// Make sure scrolling is restored when component is unmounted
onUnmounted(() => {
  document.body.style.overflow = ""; // Restore scrolling
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
      // Clear checkpoints for virtual events
      newEvent.checkpoints = [];
      newEvent.challengeFormLink = "";
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
    if (isEditMode.value) {
      // Update existing event
      const updatedEvent: Event = {
        ...props.eventToEdit!,
        ...newEvent,
      };
      document.body.style.overflow = ""; // Restore scrolling before emitting
      emit("event-updated", updatedEvent);
    } else {
      // Create new event
      const createdEvent: Event = {
        ...newEvent,
        id: Date.now().toString(),
      };
      document.body.style.overflow = ""; // Restore scrolling before emitting
      emit("event-created", createdEvent);
    }
  }
};

const cancel = () => {
  document.body.style.overflow = ""; // Ensure scrolling is restored
  emit("cancel");
};

const handleModalClose = () => {
  document.body.style.overflow = ""; // Ensure scrolling is restored
  emit("cancel");
};
</script>

<template>
  <UModal
    :open="isOpen"
    @update:open="handleModalClose"
    :close="{ onClick: cancel }"
    :title="isEditMode ? `Edit ${newEvent.eventType === 'virtual_event' ? 'Virtual Event' : 'Skill Sprint'}` : `Create ${newEvent.eventType === 'virtual_event' ? 'Virtual Event' : 'Skill Sprint'}`"
  >
    <template #body>
      <div class="p-4 bg-dark text-white max-h-[70vh] overflow-y-auto">
        <form @submit.prevent="submitForm">
          <!-- Basic Event Info -->
          <div class="space-y-8 mb-8">
            <UForm :state="newEvent">
              <UInput
                v-model="newEvent.title"
                placeholder="Enter event title"
                class="w-full dark-input mb-8"
              />

              <UTextarea
                v-model="newEvent.description"
                placeholder="Enter event description"
                :rows="4"
                class="w-full dark-input mb-8"
              />

              <UInput
                v-model="newEvent.date"
                type="date"
                class="w-full dark-input mb-8"
              />

              <USelect
                v-model="newEvent.status"
                :items="statusOptions"
                placeholder="Select event status"
                class="w-full dark-select mb-8"
              />

              <div
                label="Tags"
                help="Select relevant tags for your event (helps with discoverability)"
                class="mb-8"
              >
                <div class="flex flex-wrap gap-2 mb-3">
                  <UBadge
                    v-for="(tag, index) in newEvent.tags || []"
                    :key="index"
                    :color="newEvent.eventType === 'virtual_event' ? 'info' : 'primary'"
                    class="flex items-center"
                  >
                    {{ tagOptions.find((t) => t.value === tag)?.label || tag }}
                    <UButton
                      size="xs"
                      icon="i-heroicons-x-mark"
                      class="ml-1"
                      :color="newEvent.eventType === 'virtual_event' ? 'info' : 'primary'"
                      @click="removeTag(index)"
                    />
                  </UBadge>
                  <p
                    v-if="(newEvent.tags || []).length === 0"
                    class="text-sm text-gray-400 italic"
                  >
                    No tags added yet
                  </p>
                </div>
                <div class="flex gap-2 mb-8">
                  <USelect
                    v-model="selectedTag"
                    :items="tagOptions"
                    placeholder="Select a tag"
                    class="flex-grow dark-select"
                  />
                  <UButton @click="addTag" :disabled="!selectedTag" :color="buttonColor"
                    >Add Tag</UButton
                  >
                </div>

                <UInput
                  v-if="newEvent.eventType === 'builders_skill_sprint'"
                  v-model="newEvent.challengeFormLink"
                  :placeholder="'Hands-on Form Link'"
                  class="w-full dark-input mb-8"
                />

                <!-- Meetup Link for Virtual Events -->
                <UInput
                  v-if="newEvent.eventType === 'virtual_event'"
                  v-model="newEvent.meetupLink"
                  placeholder="Meetup URL"
                  class="w-full dark-input mb-8"
                />
              </div>
            </UForm>
          </div>

          <!-- Checkpoints Section - Only show for Builders Skill Sprint -->
          <template v-if="newEvent.eventType === 'builders_skill_sprint'">
            <UDivider class="border-gray-700" />
            <div class="my-8 space-y-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium border-b border-gray-700 pb-2">
                  Checkpoints
                </h3>
                <p class="text-sm text-gray-400">
                  {{ newEvent.checkpoints.length }} checkpoints added
                </p>
              </div>

              <div class="space-y-8">
                <div
                  v-if="newEvent.checkpoints.length > 0"
                  class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                >
                  <div
                    v-for="(checkpoint, index) in newEvent.checkpoints"
                    :key="index"
                    class="p-4 border border-gray-700 rounded-md bg-gray-800"
                  >
                    <div class="flex justify-between items-start">
                      <div>
                        <h4 class="font-medium text-lg">
                          {{ checkpoint.title }}
                        </h4>
                        <p class="text-xs text-gray-400 mb-2">
                          {{ checkpoint.date }}
                        </p>
                      </div>
                      <UButton
                        color="primary"
                        variant="ghost"
                        icon="i-heroicons-trash"
                        size="xs"
                        @click="removeCheckpoint(index)"
                      />
                    </div>
                    <p class="text-sm mb-3">{{ checkpoint.description }}</p>
                    <div class="flex flex-wrap gap-2">
                      <UBadge
                        v-if="checkpoint.meetupUrl"
                        color="primary"
                        size="sm"
                        >Has Meetup Link</UBadge
                      >
                      <UBadge
                        v-if="checkpoint.youtubeVideoId"
                        color="primary"
                        size="sm"
                        >Has YouTube Video</UBadge
                      >
                      <UBadge
                        v-if="checkpoint.posterImage"
                        color="primary"
                        size="sm"
                        >Has Poster Image</UBadge
                      >
                    </div>
                  </div>
                </div>
                <p
                  v-else
                  class="text-sm text-gray-400 italic text-center py-4 border border-gray-700 rounded-md bg-gray-800"
                >
                  No checkpoints added yet. Add your first checkpoint below.
                </p>

                <div class="border border-gray-700 rounded-md p-6 bg-gray-800">
                  <h4
                    class="font-medium mb-6 text-lg border-b border-gray-700 pb-2"
                  >
                    Add New Checkpoint
                  </h4>
                  <div class="space-y-6">
                    <UForm label="Checkpoint Title" required>
                      <UInput
                        v-model="newCheckpoint.title"
                        placeholder="Checkpoint Title"
                        class="w-full dark-input mb-8"
                      />

                      <UInput
                        v-model="newCheckpoint.date"
                        type="date"
                        class="w-full dark-input mb-8"
                      />

                      <UTextarea
                        v-model="newCheckpoint.description"
                        placeholder="Describe what will happen at this checkpoint"
                        :rows="2"
                        class="w-full dark-input mb-8"
                      />

                      <UInput
                        v-model="newCheckpoint.meetupUrl"
                        placeholder="Meetup URL."
                        class="w-full dark-input mb-8"
                      />

                      <UFormField label="Upload Poster Image">
                        <UInput
                          v-model="newCheckpoint.posterImage"
                          type="file"
                          class="w-full dark-input mb-8"
                        />
                      </UFormField>

                      <UButton
                        block
                        color="primary"
                        @click="addCheckpoint"
                        :disabled="
                          !newCheckpoint.title || !newCheckpoint.description
                        "
                      >
                        <UIcon name="i-heroicons-plus" class="mr-1" />
                        Add Checkpoint
                      </UButton>
                    </UForm>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Virtual Event Details - Simplified form -->
          <template v-if="newEvent.eventType === 'virtual_event'">
            <UDivider class="border-gray-700" />
            <div class="my-8 space-y-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium border-b border-gray-700 pb-2 text-info-500">
                  Virtual Event Details
                </h3>
              </div>

              <div class="space-y-6">
                <UFormField label="Event Poster Image">
                  <UInput
                    v-model="newCheckpoint.posterImage"
                    type="file"
                    class="w-full dark-input mb-8"
                  />
                </UFormField>

                <UFormField label="YouTube Video ID">
                  <UInput
                    v-model="newCheckpoint.youtubeVideoId"
                    placeholder="e.g., dQw4w9WgXcQ"
                    class="w-full dark-input mb-8"
                  />
                </UFormField>
              </div>
            </div>
          </template>

          <!-- Resources Section -->
          <UDivider class="border-gray-700" />
          <div class="my-8 space-y-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium border-b border-gray-700 pb-2">
                Resources
              </h3>
            </div>

            <div class="space-y-8">
              <div
                v-if="newEvent.resources.length > 0"
                class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
              >
                <div
                  v-for="(resource, index) in newEvent.resources"
                  :key="index"
                  class="p-4 border border-gray-700 rounded-md bg-gray-800"
                >
                  <div class="flex justify-between">
                    <div class="flex items-center">
                      <UIcon
                        :name="
                          resource.type === 'document'
                            ? 'i-heroicons-document-text'
                            : resource.type === 'video'
                            ? 'i-heroicons-video-camera'
                            : resource.type === 'code'
                            ? 'i-heroicons-code-bracket'
                            : 'i-heroicons-link'
                        "
                        class="mr-2 text-primary-500"
                      />
                      <h4 class="font-medium">{{ resource.title }}</h4>
                    </div>
                    <UButton
                      color="primary"
                      variant="ghost"
                      icon="i-heroicons-trash"
                      size="xs"
                      @click="removeResource(index)"
                    />
                  </div>
                  <p class="text-xs text-gray-400 mt-1 break-all">
                    {{ resource.link }}
                  </p>
                </div>
              </div>
              <p
                v-else
                class="text-sm text-gray-400 italic text-center py-4 border border-gray-700 rounded-md bg-gray-800"
              >
                No resources added yet. Add your first resource below.
              </p>

              <div class="border border-gray-700 rounded-md p-6 bg-gray-800">
                <h4
                  class="font-medium mb-6 text-lg border-b border-gray-700 pb-2"
                >
                  Add New Resource
                </h4>
                <div class="space-y-6">
                  <UForm :state="newResource">
                    <UInput
                      v-model="newResource.title"
                      placeholder="e.g., Getting Started Guide"
                      class="w-full dark-input mb-6"
                    />

                    <UInput
                      v-model="newResource.link"
                      placeholder="https://example.com/resource"
                      class="w-full dark-input mb-6"
                    />

                    <USelect
                      v-model="newResource.type"
                      :items="resourceTypeOptions"
                      class="w-full dark-select mb-6"
                    />

                    <UButton
                    block
                    color="primary"
                    @click="addResource"
                    :disabled="!newResource.title || !newResource.link"
                  >
                    <UIcon name="i-heroicons-plus" class="mr-1" />
                    Add Resource
                  </UButton>
                  </UForm>

                  
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 p-4 bg-dark text-white w-full">
        <div class="ml-auto flex gap-2">
          <UButton variant="outline" color="neutral" @click="cancel"
            >Cancel</UButton
          >
          <UButton :color="buttonColor" @click="submitForm">
            {{ isEditMode ? 'Update Event' : 'Create Event' }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
/* Fix for dropdowns to ensure they display properly */
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

/* Fix all form labels to be white */
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

.media-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  align-items: center;
}

/* Remove the custom modal styling since we're using UModal */
</style>
