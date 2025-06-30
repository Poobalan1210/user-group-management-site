<script setup lang="ts">
import { h, resolveComponent, ref, onMounted } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Participant, Submission } from '../types';
import { useLeaderboardStore } from '../stores/leaderboardStore';

const leaderboardStore = useLeaderboardStore();
const expanded = ref({});
const globalFilter = ref("");

onMounted(() => {
  leaderboardStore.fetchLeaderboardData();
});

function getDetailData(row: any) {
  return row.submissions || [];
}

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");

const columns: TableColumn<Participant>[] = [
  {
    id: "expand",
    cell: ({ row }) =>
      h(UButton, {
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
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "totalSubmissions",
    header: "Total Approved Submissions",
  },
  {
    accessorKey: "totalPoints",
    header: "Available Points",
    cell: ({ row }) => {
      const points = Number.parseFloat(row.getValue("totalPoints"));
      return h("div", { class: "font-medium" }, points.toLocaleString());
    },
  },
  {
    accessorKey: "profileUrl",
    header: "Profile",
    cell: ({ row }) => {
      return h(UButton, {
        color: "primary",
        variant: "soft",
        size: "xs",
        icon: "i-lucide-external-link",
        label: "View Profile",
        to: `/profile/${encodeURIComponent(row.original.email)}`,
      });
    },
  },
];

const detailColumns: TableColumn<Submission>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return new Date(row.getValue("date")).toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    },
  },
  {
    accessorKey: "type",
    header: "Submission Type",
  },
  {
    accessorKey: "points",
    header: "Points",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const color = {
        "Approved": "success" as const,
        "Pending": "warning" as const,
        "Rejected": "error" as const,
      }[status];

      return h(UBadge, { class: "capitalize", variant: "subtle", color }, () =>
        status
      );
    },
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => {
      return h(UButton, {
        color: "primary",
        variant: "ghost",
        size: "xs",
        icon: "i-lucide-link",
        label: "View",
        onClick: () => window.open(row.getValue("url"), '_blank'),
      });
    },
  },
];
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-2xl">Leaderboard</h3>
      <UInput v-model="globalFilter" class="max-w-sm" placeholder="Search" :disabled="leaderboardStore.isLoading" />
    </div>
    
    <div v-if="leaderboardStore.isLoading" class="text-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="text-4xl animate-spin mx-auto mb-4" />
      <p class="text-gray-600">Loading leaderboard...</p>
    </div>
    
    <div v-else-if="leaderboardStore.error" class="text-center py-8">
      <UIcon name="i-lucide-alert-circle" class="text-4xl text-red-400 mx-auto mb-4" />
      <p class="text-red-600 mb-4">{{ leaderboardStore.error }}</p>
    </div>
    
    <div v-else class="border-1 border-gray-700 rounded-lg p-1 overflow-hidden">
      <UTable
        v-model:expanded="expanded"
        :data="leaderboardStore.data"
        :columns="columns"
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
          <div class="p-4 rounded-lg">
            <h4 class="font-bold mb-2">Submission Details</h4>
            <UTable
              :columns="detailColumns"
              :data="getDetailData(row.original)"
              :ui="{
                base: 'border-0 shadow-none',
                thead: 'bg-gray-50 dark:bg-gray-800',
                th: 'px-3 py-2 text-sm',
                td: 'px-3 py-2 text-sm',
              }"
            />
          </div>
        </template>
      </UTable>
    </div>
  </div>
</template>
