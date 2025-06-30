<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Event } from '../data/events';
import { useAdmin } from '../composables/useAdmin';
import { useAuthStore } from '../auth/authStore';
import { SubmissionService} from '../services/submissionService';
import ChallengeForm from './ChallengeForm.vue';
import RichTextDisplay from './RichTextDisplay.vue';

const props = defineProps<{
  event: Event;
}>();

const emit = defineEmits<{
  (e: 'edit', event: Event): void;
}>();

const { isAdmin } = useAdmin();

const isExpanded = ref(false);
const showResources = ref(false);
const showChallengeForm = ref(false);
const showChallengeModal = ref(false);
const activeCheckpoint = ref<number | null>(null);
const hasSubmitted = ref(false);
const isCheckingSubmission = ref(false);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
  if (!isExpanded.value) {
    showResources.value = false;
    showChallengeForm.value = false;
    activeCheckpoint.value = null;
  }
  // Ensure scrolling is always enabled
  document.body.style.overflow = "";
};

const toggleResources = (e: MouseEvent) => {
  e.stopPropagation();
  showResources.value = !showResources.value;
  // Ensure scrolling is always enabled
  document.body.style.overflow = "";
};

const toggleChallengeForm = (e: MouseEvent) => {
  e.stopPropagation();
  showChallengeForm.value = !showChallengeForm.value;
  // Ensure scrolling is always enabled
  document.body.style.overflow = "";
};

const handleChallengeSubmit = async (data: any) => {
  const authStore = useAuthStore();

  try {
    const submission = {
      eventTitle: props.event.title,
      schemaId: data.schemaId,
      schemaName: data.schemaName,
      formData: data,
      submittedAt: data.submittedAt,
      submittedBy: authStore.user?.attributes?.email || 'anonymous',
      fileUrl: data.projectFileUrl || '',
    };

    // Submit the challenge using the submission service
    await SubmissionService.submitChallenge(submission);
    
    // Update submission status
    hasSubmitted.value = true;

    // Show success message using toast (if available) or alert
    if (window.$toast) {
      window.$toast.add({
        title: 'Success!',
        description: 'Challenge submitted successfully! Your submission has been recorded.',
        color: 'green'
      });
    } else {
      alert('Challenge submitted successfully! Your submission has been recorded.');
    }
  } catch (error) {
    console.error('Error submitting challenge:', error);
    // Show error message
    if (window.$toast) {
      window.$toast.add({
        title: 'Error',
        description: 'Error submitting challenge. Please try again.',
        color: 'red'
      });
    } else {
      alert('Error submitting challenge. Please try again.');
    }
  }
};

const closeChallengeForm = () => {
  showChallengeModal.value = false;
};

const openChallengeModal = (e: MouseEvent) => {
  e.stopPropagation();
  showChallengeModal.value = true;
};

const toggleCheckpointDetails = (index: number, e: MouseEvent) => {
  e.stopPropagation();
  if (activeCheckpoint.value === index) {
    activeCheckpoint.value = null;
  } else {
    activeCheckpoint.value = index;
  }
  // Ensure scrolling is always enabled
  document.body.style.overflow = "";
};

const handleEdit = (e: MouseEvent) => {
  e.stopPropagation();
  // Ensure scrolling is always enabled before emitting edit event
  document.body.style.overflow = "auto";
  emit('edit', props.event);
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

// Computed property to get the poster image from event or first checkpoint
const eventPosterImage = computed(() => {
  if (props.event.posterImage) {
    return props.event.posterImage;
  } else if (props.event.checkpoints && props.event.checkpoints.length > 0 && props.event.checkpoints[0].posterImage) {
    return props.event.checkpoints[0].posterImage;
  }
  return '';
});

// Computed property to get the YouTube video ID from event or first checkpoint
const eventYoutubeVideoId = computed(() => {
  if (props.event.youtubeVideoId) {
    return props.event.youtubeVideoId;
  } else if (props.event.checkpoints && props.event.checkpoints.length > 0 && props.event.checkpoints[0].youtubeVideoId) {
    return props.event.checkpoints[0].youtubeVideoId;
  }
  return '';
});

// Check if the user has already submitted a challenge for this event
const checkUserSubmission = async () => {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated || !props.event.challengeFormSchema) {
    return;
  }
  
  const userEmail = authStore.user?.attributes?.email;
  if (!userEmail) {
    return;
  }
  
  try {
    isCheckingSubmission.value = true;
    const userSubmissions = await SubmissionService.getUserSubmissions(userEmail);
    hasSubmitted.value = userSubmissions.some(submission => 
      submission.eventTitle === props.event.title && 
      submission.schemaId === props.event.challengeFormSchema
    );
  } catch (error) {
    console.error('Error checking user submissions:', error);
  } finally {
    isCheckingSubmission.value = false;
  }
};

// Check for existing submissions when component mounts
onMounted(() => {
  checkUserSubmission();
});



</script>

<template>
  <UCard class="w-full mb-4">
    <UCardHeader @click="toggleExpand" class="cursor-pointer" :ui="{ base: 'p-4' }">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-lg font-semibold">{{ event.title }}</h3>
          <div class="flex items-center gap-2 mt-1">
            <UBadge :color="event.eventType === 'builders_skill_sprint' ? 'primary' : 'info'" size="sm">
              {{ event.eventType === 'builders_skill_sprint' ? 'Builders Skill Sprint' : 'Virtual Event' }}
            </UBadge>
            <p class="text-sm text-gray-500">{{ formatMonthYear(event.date) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <UButton v-if="isAdmin" size="xs" :color="event.eventType === 'builders_skill_sprint' ? 'primary' : 'info'"
            variant="ghost" icon="i-heroicons-pencil-square" @click.stop="handleEdit" class="mr-2" />
          <UIcon :name="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="text-gray-500" />
        </div>
      </div>
    </UCardHeader>

    <div v-if="isExpanded">
      <UCardBody>
        <!-- Event Type and Tags -->
        <div class="mb-4 mt-4">
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

        <!-- Meetup Link - Only for Virtual Events -->
        <div v-if="event.eventType === 'virtual_event' && event.meetupLink" class="mb-6">
          <UButton size="sm" color="info" variant="outline" :to="event.meetupLink" target="_blank"
            icon="i-heroicons-arrow-top-right-on-square" class="mr-2">
            Register on Meetup
          </UButton>
        </div>

        <!-- Virtual Event Media -->
        <div v-if="event.eventType === 'virtual_event' && (eventPosterImage || eventYoutubeVideoId)" class="mb-6">
          <div class="media-container mb-4">
            <!-- Poster Image - Use computed property that checks both event and checkpoints -->
            <div v-if="eventPosterImage" class="w-full mb-4">
              <div class="aspect-video w-full overflow-hidden rounded-lg shadow-sm bg-gray-100 dark:bg-gray-800">
                <img :src="eventPosterImage" 
                  :alt="`Poster for ${event.title}`" class="w-full h-full object-cover"
                  @error="console.error('Failed to load poster image:', eventPosterImage)"
                  @load="console.log('Poster image loaded successfully:', eventPosterImage)" />
              </div>
            </div>

            <!-- YouTube Video Embed - Use computed property that checks both event and checkpoints -->
            <div v-if="eventYoutubeVideoId" class="aspect-video">
              <iframe class="w-full h-full rounded-lg" 
                :src="`https://www.youtube.com/embed/${eventYoutubeVideoId}`"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen></iframe>
            </div>
          </div>
        </div>
        
        <!-- Event Description -->
        <div class="mb-4">
          <RichTextDisplay :content="event.description" />
        </div>

        <!-- Checkpoints Section - Only for Builders Skill Sprint -->
        <div v-if="event.eventType === 'builders_skill_sprint' && event.checkpoints.length > 0" class="mb-6">
          <h4 class="font-medium mb-3 flex items-center">
            <UIcon name="i-heroicons-flag" class="mr-2 text-primary-500" />
            Checkpoints
          </h4>

          <div class="space-y-3">
            <UCard v-for="(checkpoint, index) in sortedCheckpoints" :key="index" class="border border-gray-200"
              @click.stop="toggleCheckpointDetails(index, $event)">
              <div class="flex justify-between items-start">
                <div>
                  <div class="flex items-center">
                    <UBadge color="primary" class="mr-2">{{ index + 1 }}</UBadge>
                    <h5 class="font-medium">{{ checkpoint.title }}</h5>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">{{ formatDate(checkpoint.date) }}</p>
                </div>
                <UIcon :name="activeCheckpoint === index ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                  class="text-gray-500" />
              </div>

              <!-- Expanded Checkpoint Details -->
              <div v-if="activeCheckpoint === index" class="mt-4 pt-4 border-t">
                <!-- Checkpoint Meetup Link -->
                <div v-if="checkpoint.meetupUrl" class="mb-4">
                  <UButton size="sm" color="primary" :to="checkpoint.meetupUrl" target="_blank"
                    icon="i-heroicons-arrow-top-right-on-square" class="mr-2">
                    Register On Meetup
                  </UButton>
                </div>

                <!-- Media Section - Poster and Video -->
                <div class="media-container mb-4">
                  <!-- Poster Image -->
                  <div v-if="checkpoint.posterImage" class="aspect-video overflow-hidden">
                    <img :src="checkpoint.posterImage" :alt="`Poster for ${checkpoint.title}`"
                      class="w-full h-full object-contain rounded-lg shadow-sm" />
                  </div>

                  <!-- YouTube Video Embed -->
                  <div v-if="checkpoint.youtubeVideoId" class="aspect-video">
                    <iframe class="w-full h-full rounded-lg"
                      :src="`https://www.youtube.com/embed/${checkpoint.youtubeVideoId}`" frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen></iframe>
                  </div>
                </div>
                
                <!-- Checkpoint Description -->
                <div class="mb-4">
                  <RichTextDisplay :content="checkpoint.description" />
                </div>
              </div>
            </UCard>
          </div>
        </div>

        <!-- Challenge Submission Section - Only for Builders Skill Sprint -->
        <div v-if="event.eventType === 'builders_skill_sprint' && (event.challengeFormSchema)" class="mb-6">
          <h4 class="font-medium mb-3 flex items-center">
            <UIcon name="i-heroicons-document-check" class="mr-2 text-primary-500" />
            Challenge Submission
          </h4>

          <UCard class="border border-gray-200" @click.stop="toggleChallengeForm">
            <div class="flex justify-between items-center">
              <h5 class="font-medium">Submit your challenge</h5>
              <UIcon :name="showChallengeForm ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="text-gray-500" />
            </div>

            <div v-if="showChallengeForm" class="mt-4 pt-4 border-t">
              <div v-if="event.challengeFormSchema">
                <p class="mb-2">Submit your completed challenge:</p>
                <div v-if="useAuthStore().isAuthenticated">
                  <UButton 
                    block 
                    color="primary" 
                    icon="i-heroicons-document-text" 
                    @click="openChallengeModal"
                    :disabled="hasSubmitted || isCheckingSubmission"
                  >
                    <span v-if="isCheckingSubmission">Checking submission status...</span>
                    <span v-else-if="hasSubmitted">Already Submitted</span>
                    <span v-else>Submit Challenge</span>
                  </UButton>
                </div>
                <div v-else>
                  <p class="text-sm text-amber-600 mb-2">You need to sign in to submit your challenge</p>
                  <UButton block color="primary" to="/auth" icon="i-heroicons-user">
                    Sign In to Submit
                  </UButton>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Resources Section -->
        <div class="mb-6">
          <h4 class="font-medium mb-3 flex items-center">
            <UIcon name="i-heroicons-book-open" class="mr-2 text-primary-500" />
            Resources
          </h4>

          <UCard class="border border-gray-200" @click.stop="toggleResources">
            <div class="flex justify-between items-center">
              <h5 class="font-medium">View resources</h5>
              <UIcon :name="showResources ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="text-gray-500" />
            </div>

            <div v-if="showResources" class="mt-4 pt-4 border-t">
              <div v-for="(resource, index) in event.resources" :key="index" class="mb-2">
                <UCard class="border border-gray-200">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <UIcon :name="resource.type === 'document' ? 'i-heroicons-document-text' :
                        resource.type === 'video' ? 'i-heroicons-video-camera' :
                          resource.type === 'code' ? 'i-heroicons-code-bracket' : 'i-heroicons-link'" class="mr-2" />
                      <span>{{ resource.title }}</span>
                    </div>
                    <UButton size="xs" :color="event.eventType === 'builders_skill_sprint' ? 'primary' : 'info'"
                      :to="resource.link" target="_blank">
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

  <!-- Challenge Form Modal -->
  <Teleport to="body">
    <ChallengeForm v-if="showChallengeModal" :is-open="showChallengeModal" :event-title="event.title"
      :form-schema-id="event.challengeFormSchema" @close="closeChallengeForm" @submit="handleChallengeSubmit" />
  </Teleport>

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
  padding-bottom: 56.25%;
  /* 16:9 Aspect Ratio */
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