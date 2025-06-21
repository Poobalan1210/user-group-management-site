<script setup lang="ts">
import { useAdminData } from '../composables/useAdminData';
import { h, resolveComponent, ref } from 'vue';

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");

const { 
  submissions
} = useAdminData();

const globalFilter = ref("");
const expanded = ref<Record<string, boolean>>({});

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
          <UTable
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
                      <div class="mb-4">
                        <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Points</label>
                        <UInput
                          v-model.number="row.original.adminReview.points"
                          type="number"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div class="mb-4">
                        <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Feedback</label>
                        <UTextarea
                          v-model="row.original.adminReview.feedback"
                          :rows="5"
                          placeholder="Enter your feedback for the submission..."
                        />
                      </div>
                      <div class="flex justify-between gap-4 mt-6">
                        <div class="flex gap-2">
                          <UButton
                            color="error"
                            variant="soft"
                            @click="row.original.adminReview.status = 'Rejected'"
                          >
                            Reject
                          </UButton>
                          <UButton
                            color="success"
                            variant="soft"
                            @click="row.original.adminReview.status = 'Approved'"
                          >
                            Accept
                          </UButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </UTable>
        </div>
      </div>
    </div>
  </div>
</template> 