<script setup lang="ts">
import { h, resolveComponent, ref, onMounted } from 'vue';
import { SubmissionService } from '../services/submissionService';
import { useStoreItemsStore } from '../stores/storeItemsStore';
import { creditsVouchersManager } from '../services/creditsVouchersManagerService';

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const USelectMenu = resolveComponent("USelectMenu");

// State for submissions and loading states
const submissions = ref([]);
const isLoading = ref(true);
const isSaving = ref(false);
const stats = ref({
  totalSubmissions: 0,
  pendingSubmissions: 0,
  approvedSubmissions: 0,
  rejectedSubmissions: 0,
  totalPoints: 0
});

// Fetch submissions and stats on component mount
onMounted(async () => {
  try {
    isLoading.value = true;
    
    // Get only pending submissions for admin review
    const submissionsData = await SubmissionService.getAllSubmissions({ status: 'pending' });
    submissions.value = submissionsData.map(submission => ({
      id: submission.submissionId,
      name: submission.formData?.projectName || submission.formData?.title || 'Unnamed Submission',
      email: submission.submittedBy,
      event: submission.eventTitle,
      type: submission.submissionType || 'Challenge',
      date: submission.submittedAt,
      content: JSON.stringify(submission.formData),
      link: submission.formData?.githubUrl || submission.formData?.projectUrl || submission.formData?.articleUrl || '#',
      aiAnalysis: {
        relevance: Math.floor(Math.random() * 30) + 70, // Mock data
        quality: Math.floor(Math.random() * 30) + 70,   // Mock data
        originality: Math.floor(Math.random() * 30) + 70, // Mock data
        summary: 'This is an automatically generated summary of the submission content.'
      },
      adminReview: {
        points: submission.points || 0,
        feedback: submission.feedback || '',
        status: submission.status || 'Pending'
      },
      // Store the original submission ID for updates
      originalSubmissionId: submission.submissionId
    }));
    
    // Get submission stats
    try {
      const statsData = await SubmissionService.getSubmissionStats();
      stats.value = statsData;
    } catch (statsError) {
      console.error('Error fetching submission stats:', statsError);
    }
  } catch (error) {
    console.error('Error fetching submissions:', error);
  } finally {
    isLoading.value = false;
  }
});

// Function to update a submission
const updateSubmission = async (submission) => {
  try {
    isSaving.value = true;
    const submissionId = submission.originalSubmissionId;
    if (!submissionId) {
      console.error('Missing submission ID for update');
      return;
    }
    
    await SubmissionService.updateSubmission(submissionId, {
      status: submission.adminReview.status.toLowerCase(),
      points: submission.adminReview.points,
      feedback: submission.adminReview.feedback
    });
    
    // Remove submission from admin dashboard after processing
    if (submission.adminReview.status === 'Approved' || submission.adminReview.status === 'Rejected') {
      // Remove from the submissions list in the UI
      const index = submissions.value.findIndex(sub => sub.originalSubmissionId === submissionId);
      if (index !== -1) {
        submissions.value.splice(index, 1);
      }
      
      // Note: The submission is not deleted from the database, just marked as processed
      // This allows for historical tracking and user profile display
    }
    
    // Page will refresh, no need for toast
    
    // Refresh the page
    window.location.reload();
  } catch (error) {
    console.error('Error updating submission:', error);
    
    // Show error message
    if (window.$toast) {
      window.$toast.add({
        title: 'Error',
        description: 'Failed to update submission',
        color: 'red'
      });
    } else {
      alert('Failed to update submission');
    }
  } finally {
    isSaving.value = false;
  }
};

const globalFilter = ref("");
const expanded = ref<Record<string, boolean>>({});

// Store items
const storeItemsStore = useStoreItemsStore();
// We can also use creditsVouchersManager directly
const creditsFile = ref<File | null>(null);
const vouchersFile = ref<File | null>(null);

// Handle file uploads
const handleCreditsFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    creditsFile.value = input.files[0];
  }
};

const handleVouchersFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    vouchersFile.value = input.files[0];
  }
};

const uploadCreditsFile = async () => {
  if (!creditsFile.value) return;
  await creditsVouchersManager.processCreditsCSV(creditsFile.value);
  creditsFile.value = null;
};

const uploadVouchersFile = async () => {
  if (!vouchersFile.value) return;
  await creditsVouchersManager.processVouchersCSV(vouchersFile.value);
  vouchersFile.value = null;
};

const columns = [
  {
    id: "expand",
    cell: ({ row }: { row: any }) =>
      h(resolveComponent("UButton"), {
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-chevron-down",
        square: true,
        ui: {
          leadingIcon: [
            "transition-transform",
            row.getIsExpanded() ? "duration-200 rotate-180" : "",
          ],
        },
        onClick: () => row.toggleExpanded(),
      }),
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }: { row: any }) => {
      return h(UBadge, { color: "primary", variant: "subtle" }, () => row.getValue("type"));
    },
  },
  {
    accessorKey: 'event',
    header: 'Tag',
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }: { row: any }) => new Date(row.getValue('date')).toLocaleDateString()
  },
  {
    accessorKey: 'link',
    header: 'Link',
    cell: ({ row }: { row: any }) => {
      return h(UButton, {
        color: "primary",
        variant: "ghost",
        size: "xs",
        icon: "i-lucide-link",
        label: "View Submission",
        onClick: () => window.open(row.getValue("link"), '_blank'),
      });
    },
  }
];
</script>

<template>
  <div>
    <div class="font-bold text-3xl text-center text-primary-500 mb-6 ml-6">
      <h1>Admin Dashboard</h1>
    </div>

    <div class="container mx-auto px-4 py-6">
      <div>
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-2xl">Submissions</h3>
          <UInput v-model="globalFilter" class="max-w-sm" placeholder="Search" />
        </div>
        
        <div class="border-1 border-gray-700 rounded-lg p-1 overflow-hidden">
          <!-- Loading spinner -->
          <div v-if="isLoading" class="py-12">
            <UIcon name="i-heroicons-arrow-path" class="text-4xl animate-spin mx-auto mb-4" />
            <p class="text-center text-gray-500">Loading submissions...</p>
          </div>
          
          <UTable
            v-else
            :columns="columns"
            :data="submissions"
            v-model:expanded="expanded"
            v-model:global-filter="globalFilter"
            :ui="{
              tr: 'data-[expanded=true]:bg-(--ui-bg-elevated)/50',
              base: 'overflow-hidden border-2 border-gray-300 dark:border-gray-700 rounded-lg shadow',
              thead: 'bg-gray-50 dark:bg-gray-800',
              th: 'border-b border-gray-200 dark:border-gray-700 text-lg',
              td: 'border-b border-gray-200 dark:border-gray-700 text-lg',
            }"
          >
            <template #expanded="{ row }">
              <div class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div class="space-y-6">
                  <!-- Submission Details -->
                  <div>
                    <h3 class="text-lg font-semibold mb-2 text-primary-600 dark:text-primary-400">Submission Details</h3>
                    <div class="grid grid-cols-2 gap-2 mb-3">
                      <div class="font-medium text-gray-700 dark:text-gray-300">Name:</div>
                      <div>{{ row.original.name }}</div>
                      <div class="font-medium text-gray-700 dark:text-gray-300">Email:</div>
                      <div>{{ row.original.email }}</div>
                      <div class="font-medium text-gray-700 dark:text-gray-300">Type:</div>
                      <div>{{ row.original.type }}</div>
                      <div class="font-medium text-gray-700 dark:text-gray-300">Event:</div>
                      <div>{{ row.original.event }}</div>
                      <div class="font-medium text-gray-700 dark:text-gray-300">Date:</div>
                      <div>{{ new Date(row.original.date).toLocaleString() }}</div>
                    </div>
                    
                  </div>

                  <!-- AI Analysis -->
                  <div>
                    <h3 class="text-lg font-semibold mb-2 text-primary-600 dark:text-primary-400">AI Analysis</h3>
                    <div class="space-y-4">
                      <div class="grid grid-cols-3 gap-4">
                        <div>
                          <div class="font-medium mb-1 text-gray-700 dark:text-gray-300">Relevance</div>
                          <UProgress
                            v-model="row.original.aiAnalysis.relevance"
                            :max="100"
                            :color="row.original.aiAnalysis.relevance > 70 ? 'success' : 'warning'"
                          />
                          <div class="text-right text-sm mt-1">{{ row.original.aiAnalysis.relevance }}/100</div>
                        </div>
                        <div>
                          <div class="font-medium mb-1 text-gray-700 dark:text-gray-300">Quality</div>
                          <UProgress
                            v-model="row.original.aiAnalysis.quality"
                            :max="100"
                            :color="row.original.aiAnalysis.quality > 70 ? 'success' : 'warning'"
                          />
                          <div class="text-right text-sm mt-1">{{ row.original.aiAnalysis.quality }}/100</div>
                        </div>
                        <div>
                          <div class="font-medium mb-1 text-gray-700 dark:text-gray-300">Originality</div>
                          <UProgress
                          v-model="row.original.aiAnalysis.originality"
                            :max="100"
                            :color="row.original.aiAnalysis.originality > 70 ? 'success' : 'warning'"
                          />
                          <div class="text-right text-sm mt-1">{{ row.original.aiAnalysis.originality }}/100</div>
                        </div>
                      </div>
                      <div>
                        <h3 class="text-lg font-semibold mb-2 text-primary-600 dark:text-primary-400">AI Summary</h3>
                        <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded break-words whitespace-normal overflow-hidden">
                          {{ row.original.aiAnalysis.summary }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Admin Review -->
                  <div>
                    <h3 class="text-lg font-semibold mb-2 text-primary-600 dark:text-primary-400">Your Review</h3>
                    <div>
                      <!-- Points and Status side by side -->
                      <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Points</label>
                          <UInput
                            v-model.number="row.original.adminReview.points"
                            type="number"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
                          <USelectMenu
                            v-model="row.original.adminReview.status"
                            :items="[
                              'Approved',
                              'Rejected'
                            ]"
                            placeholder="Select status"
                            :ui="{
                              option: { container: { active: 'bg-primary-500 text-white' } }
                            }"
                          />
                        </div>
                      </div>
                      
                      <!-- Feedback below -->
                      <div class="mb-4">
                        <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Feedback</label>
                        <UTextarea
                          v-model="row.original.adminReview.feedback"
                          :rows="5"
                          placeholder="Enter your feedback for the submission..."
                        />
                      </div>
                      
                      <!-- Save changes button -->
                      <UButton
                        color="primary"
                        @click="updateSubmission(row.original)"
                        :loading="isSaving"
                        class="mt-4"
                      >
                        Save Changes
                      </UButton>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </UTable>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-6">
      <div>
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-2xl">Store</h3>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Credits Management -->
          <div class="border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow">
            <div class="flex justify-between items-center mb-4">
              <h4 class="font-bold text-xl text-primary-600 dark:text-primary-400">Credits Management</h4>
              <UButton 
                color="primary" 
                variant="ghost" 
                icon="i-lucide-refresh-cw" 
                @click="storeItemsStore.fetchCreditsVouchersCounts"
                :loading="storeItemsStore.isLoading"
                size="sm"
              >
                Refresh
              </UButton>
            </div>
            
            <div class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-700 dark:text-gray-300">Available Credits:</span>
                <UBadge color="primary" size="lg">{{ storeItemsStore.creditsCount.available }}</UBadge>
              </div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-700 dark:text-gray-300">Redeemed Credits:</span>
                <UBadge color="gray" size="lg">{{ storeItemsStore.creditsCount.redeemed }}</UBadge>
              </div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-700 dark:text-gray-300">Total Credits:</span>
                <UBadge color="blue" size="lg">{{ storeItemsStore.creditsCount.available + storeItemsStore.creditsCount.redeemed }}</UBadge>
              </div>
              
              <div class="border-t border-gray-200 dark:border-gray-700 my-4"></div>
              
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Upload Credits CSV</label>
                <p class="text-xs text-gray-500 mb-2">CSV format: code,value</p>
                
                <div class="flex items-center space-x-2">
                  <input 
                    type="file" 
                    accept=".csv" 
                    @change="handleCreditsFileChange"
                    class="block w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-md file:border-0
                           file:text-sm file:font-semibold
                           file:bg-primary-50 file:text-primary-700
                           hover:file:bg-primary-100"
                  />
                  <UButton 
                    color="primary" 
                    :disabled="!creditsFile" 
                    @click="uploadCreditsFile"
                    :loading="storeItemsStore.isLoading"
                  >
                    Upload
                  </UButton>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Vouchers Management -->
          <div class="border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow">
            <div class="flex justify-between items-center mb-4">
              <h4 class="font-bold text-xl text-primary-600 dark:text-primary-400">Vouchers Management</h4>
              <UButton 
                color="primary" 
                variant="ghost" 
                icon="i-lucide-refresh-cw" 
                @click="storeItemsStore.fetchCreditsVouchersCounts"
                :loading="storeItemsStore.isLoading"
                size="sm"
              >
                Refresh
              </UButton>
            </div>
            
            <div class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-700 dark:text-gray-300">Available Vouchers:</span>
                <UBadge color="primary" size="lg">{{ storeItemsStore.vouchersCount.available }}</UBadge>
              </div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-700 dark:text-gray-300">Redeemed Vouchers:</span>
                <UBadge color="gray" size="lg">{{ storeItemsStore.vouchersCount.redeemed }}</UBadge>
              </div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-700 dark:text-gray-300">Total Vouchers:</span>
                <UBadge color="blue" size="lg">{{ storeItemsStore.vouchersCount.available + storeItemsStore.vouchersCount.redeemed }}</UBadge>
              </div>
              
              <div class="border-t border-gray-200 dark:border-gray-700 my-4"></div>
              
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Upload Vouchers CSV</label>
                <p class="text-xs text-gray-500 mb-2">CSV format: code,description</p>
                
                <div class="flex items-center space-x-2">
                  <input 
                    type="file" 
                    accept=".csv" 
                    @change="handleVouchersFileChange"
                    class="block w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-md file:border-0
                           file:text-sm file:font-semibold
                           file:bg-primary-50 file:text-primary-700
                           hover:file:bg-primary-100"
                  />
                  <UButton 
                    color="primary" 
                    :disabled="!vouchersFile" 
                    @click="uploadVouchersFile"
                    :loading="storeItemsStore.isLoading"
                  >
                    Upload
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 