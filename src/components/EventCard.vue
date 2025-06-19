<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Event } from '../data/events';

const props = defineProps<{
  event: Event;
}>();

const isExpanded = ref(false);
const showResources = ref(false);
const showChallengeForm = ref(false);
const activeCheckpoint = ref<number | null>(null);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
  if (!isExpanded.value) {
    showResources.value = false;
    showChallengeForm.value = false;
    activeCheckpoint.value = null;
  }
};

const toggleResources = (e: MouseEvent) => {
  e.stopPropagation();
  showResources.value = !showResources.value;
};

const toggleChallengeForm = (e: MouseEvent) => {
  e.stopPropagation();
  showChallengeForm.value = !showChallengeForm.value;
};

const toggleCheckpointDetails = (index: number, e: MouseEvent) => {
  e.stopPropagation();
  if (activeCheckpoint.value === index) {
    activeCheckpoint.value = null;
  } else {
    activeCheckpoint.value = index;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatMonthYear = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
};


const sortedCheckpoints = computed(() => {
  return [...props.event.checkpoints].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
});




</script>

<template>
  <UCard class="w-full mb-4">
    <UCardHeader @click="toggleExpand" class="cursor-pointer" :ui="{ base: 'p-4' }">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-lg font-semibold">{{ event.title }}</h3>
          <div class="flex items-center gap-2 mt-1">
            <UBadge color="primary" size="sm">
              {{ event.eventType === 'builders_skill_sprint' ? 'Builders Skill Sprint' : 'Virtual Event' }}
            </UBadge>
            <p class="text-sm text-gray-500">{{ formatMonthYear(event.date) }}</p>
          </div>
        </div>
        <div class="flex items-center">
          <UIcon
            :name="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
            class="text-gray-500"
          />
        </div>
      </div>
    </UCardHeader>

    <div v-if = "isExpanded">
      <UCardBody>
        <p class="mb-4">{{ event.description }}</p>
        
        <!-- Event Type and Tags -->
        <div class="mb-4">
          <div class="flex flex-wrap gap-2 items-center mb-2">
            <span class="text-sm font-medium">Tags:</span>
            <div v-if="event.tags && event.tags.length > 0" class="flex flex-wrap gap-2 items-center">
              <UBadge v-for="(tag, index) in event.tags" :key="index" color="neutral" size="sm">
                {{ tag }}
              </UBadge>
            </div>
            <span v-else class="text-sm text-gray-500 italic">No tags</span>
          </div>
        </div>
        
        <!-- Meetup Link -->
        <div v-if="event.meetupLink" class="mb-6">
          <UButton
            size="sm"
            color="primary"
            variant="outline"
            :to="event.meetupLink"
            target="_blank"
            icon="i-heroicons-user-group"
          >
            Main Meetup Event
          </UButton>
        </div>
        
        <!-- Checkpoints Section - Only for Builders Skill Sprint -->
        <div v-if="event.eventType === 'builders_skill_sprint' && event.checkpoints.length > 0" class="mb-6">
          <h4 class="font-medium mb-3 flex items-center">
            <UIcon name="i-heroicons-flag" class="mr-2 text-primary-500" />
            Checkpoints
          </h4>
          
          <div class="space-y-3">
            <UCard 
              v-for="(checkpoint, index) in sortedCheckpoints" 
              :key="index" 
              class="border border-gray-200"
              @click.stop="toggleCheckpointDetails(index, $event)"
            >
              <div class="flex justify-between items-start">
                <div>
                  <div class="flex items-center">
                    <UBadge color="primary" class="mr-2">{{ index + 1 }}</UBadge>
                    <h5 class="font-medium">{{ checkpoint.title }}</h5>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">{{ formatDate(checkpoint.date) }}</p>
                </div>
                <UIcon
                  :name="activeCheckpoint === index ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                  class="text-gray-500"
                />
              </div>
              
              <!-- Expanded Checkpoint Details -->
              <div v-if="activeCheckpoint === index" class="mt-4 pt-4 border-t">
                <p class="mb-4">{{ checkpoint.description }}</p>
                
                <!-- Checkpoint Meetup Link -->
                <div v-if="checkpoint.meetupUrl" class="mb-4">
                  <UButton
                    size="sm"
                    color="primary"
                    :to="checkpoint.meetupUrl"
                    target="_blank"
                    icon="i-heroicons-user-group"
                  >
                    Join Meetup
                  </UButton>
                </div>
                
                <!-- Media Section - Poster and Video -->
                <div class="media-container mb-4">
                  <!-- Poster Image -->
                  <div v-if="checkpoint.posterImage" class="aspect-video overflow-hidden">
                    <img 
                      :src="checkpoint.posterImage" 
                      :alt="`Poster for ${checkpoint.title}`"
                      class="w-full h-full object-contain rounded-lg shadow-sm"
                    />
                  </div>
                  
                  <!-- YouTube Video Embed -->
                  <div v-if="checkpoint.youtubeVideoId" class="aspect-video">
                    <iframe
                      class="w-full h-full rounded-lg"
                      :src="`https://www.youtube.com/embed/${checkpoint.youtubeVideoId}`"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                    ></iframe>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </div>
        
        <!-- Challenge Submission Section - Only for Builders Skill Sprint -->
        <div v-if="event.eventType === 'builders_skill_sprint' && event.challengeFormLink" class="mb-6">
          <h4 class="font-medium mb-3 flex items-center">
            <UIcon name="i-heroicons-document-check" class="mr-2 text-primary-500" />
            Challenge Submission
          </h4>
          
          <UCard 
            class="border border-gray-200"
            @click.stop="toggleChallengeForm"
          >
            <div class="flex justify-between items-center">
              <h5 class="font-medium">Submit your challenge</h5>
              <UIcon
                :name="showChallengeForm ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="text-gray-500"
              />
            </div>
            
            <div v-if="showChallengeForm" class="mt-4 pt-4 border-t">
              <p class="mb-4">Submit your completed challenge using the form below:</p>
              <UButton
                block
                color="primary"
                :to="event.challengeFormLink"
                target="_blank"
                icon="i-heroicons-document-text"
              >
                Open Submission Form
              </UButton>
            </div>
          </UCard>
        </div>
        
        <!-- Resources Section -->
        <div class="mb-6">
          <h4 class="font-medium mb-3 flex items-center">
            <UIcon name="i-heroicons-book-open" class="mr-2 text-primary-500" />
            Resources
          </h4>
          
          <UCard 
            class="border border-gray-200"
            @click.stop="toggleResources"
          >
            <div class="flex justify-between items-center">
              <h5 class="font-medium">View resources</h5>
              <UIcon
                :name="showResources ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="text-gray-500"
              />
            </div>
            
            <div v-if="showResources" class="mt-4 pt-4 border-t">
              <div v-for="(resource, index) in event.resources" :key="index" class="mb-2">
                <UCard class="border border-gray-200">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <UIcon
                        :name="resource.type === 'document' ? 'i-heroicons-document-text' : 
                               resource.type === 'video' ? 'i-heroicons-video-camera' : 
                               resource.type === 'code' ? 'i-heroicons-code-bracket' : 'i-heroicons-link'"
                        class="mr-2"
                      />
                      <span>{{ resource.title }}</span>
                    </div>
                    <UButton
                      size="xs"
                      color="primary"
                      :to="resource.link"
                      target="_blank"
                    >
                      Open
                    </UButton>
                  </div>
                </UCard>
              </div>
            </div>
          </UCard>
        </div>
      </UCardBody>
    </div>
  </UCard>
</template>

<style scoped>
.media-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  align-items: center;
}

.aspect-video {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
}

.aspect-video img,
.aspect-video iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style> 