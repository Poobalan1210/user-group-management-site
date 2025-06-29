<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed, ref, h, resolveComponent, onMounted } from 'vue';
import { UserService } from '../services/userService';
import { SubmissionService } from '../services/submissionService';
import { RedemptionService } from '../services/redemptionService';
import type { TableColumn } from "@nuxt/ui";
import type { Submission } from '../types';
import type { User } from '../services/userService';

const route = useRoute();
const email = decodeURIComponent(route.params.id as string);
const searchQuery = ref('');
const user = ref<User | null>(null);
const userSubmissions = ref<Submission[]>([]);
const userRedemptions = ref([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const activeTab = ref('submissions'); // 'submissions' or 'redemptions'

// Load user data and submissions
const loadUserData = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    // Get user by email
    const userData = await UserService.getUserByEmail(email);
    user.value = userData;
    
    // Get user's submissions
    const submissions = await SubmissionService.getAllSubmissions();
    const userSubs = submissions.filter(sub => sub.submittedBy === userData.email);
    
    // Transform submissions to match expected format
    userSubmissions.value = userSubs.map(sub => ({
      date: sub.submittedAt,
      name: sub.formData?.projectName || sub.formData?.title || sub.formData?.workshopTitle || 'Unnamed Submission',
      type: (sub.submissionType || 'Challenge') as 'Article' | 'Project' | 'Challenge' | 'Workshop',
      points: sub.points || 0,
      status: (sub.status === 'approved' ? 'Approved' : 
               sub.status === 'rejected' ? 'Rejected' : 'Pending') as 'Approved' | 'Pending' | 'Rejected',
      url: sub.formData?.githubUrl || sub.formData?.projectUrl || sub.formData?.articleUrl || sub.formData?.materialsUrl || '#'
    }));
    
    // Get user's redemptions
    try {
      const redemptions = await RedemptionService.getUserRedemptions(userData.email);
      userRedemptions.value = redemptions;
    } catch (redemptionError) {
      console.error('Error loading redemptions:', redemptionError);
      // Continue with user profile even if redemptions fail to load
      userRedemptions.value = [];
    }
  } catch (err) {
    console.error('Error loading user data:', err);
    error.value = 'Failed to load user profile';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadUserData();
});

const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");

// Calculate achievement stats
const achievements = computed(() => {
  if (!user.value || !userSubmissions.value) return [];
  
  const submissions = userSubmissions.value;
  const approvedSubmissions = submissions.filter(s => s.status === 'Approved');
  
  return [
    {
      name: 'Content Creator',
      description: 'Published 5+ approved articles',
      achieved: approvedSubmissions.filter(s => s.type === 'Article').length >= 5,
    },
    {
      name: 'Project Master',
      description: 'Completed 3+ approved projects',
      achieved: approvedSubmissions.filter(s => s.type === 'Project').length >= 3,
    },
    {
      name: 'Workshop Leader',
      description: 'Conducted 2+ approved workshops',
      achieved: approvedSubmissions.filter(s => s.type === 'Workshop').length >= 2,
    },
    {
      name: 'Challenge Champion',
      description: 'Completed 4+ approved challenges',
      achieved: approvedSubmissions.filter(s => s.type === 'Challenge').length >= 4,
    }
  ];
});

// Get all submissions
const allSubmissions = computed(() => {
  return userSubmissions.value || [];
});

// Define columns for submissions table
const submissionColumns: TableColumn<Submission>[] = [
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
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      return h(UBadge, { color: "primary", variant: "subtle" }, () => row.getValue("type"));
    },
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

      return h(UBadge, { variant: "subtle", color }, () => status);
    },
  },
  {
    accessorKey: "url",
    header: "Link",
    cell: ({ row }) => {
      return h(UButton, {
        color: "primary",
        variant: "ghost",
        size: "sm",
        icon: "i-lucide-external-link",
        to: row.getValue("url"),
        target: "_blank",
      }, () => "View");
    },
  },
];

// Define columns for redemptions table
const redemptionColumns = [
  {
    accessorKey: "redemptionDate",
    header: "Date",
    cell: ({ row }) => {
      return new Date(row.getValue("redemptionDate")).toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    },
  },
  {
    accessorKey: "productName",
    header: "Product",
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
        "pending": "warning" as const,
        "processed": "info" as const,
        "shipped": "primary" as const,
        "delivered": "success" as const,
        "cancelled": "error" as const,
      }[status] || "warning";

      return h(UBadge, { variant: "subtle", color }, () => status);
    },
  },
];

// Get social links from user data or generate fallbacks
const socialLinks = computed(() => {
  if (!user.value) return {
    github: '#',
    linkedin: '#'
  };
  
  return {
    github: user.value.githubUrl || '#',
    linkedin: user.value.linkedinUrl || '#'
  };
});

// Format date helper
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};
</script>

<template>
  <div v-if="isLoading" class="container mx-auto px-4 py-8 text-center">
    <UIcon name="i-heroicons-arrow-path" class="text-4xl animate-spin mx-auto mb-4" />
    <p class="mt-4 text-gray-600">Loading user profile...</p>
  </div>
  
  <div v-else-if="error" class="container mx-auto px-4 py-8 text-center">
    <UIcon name="i-lucide-alert-circle" class="text-6xl mx-auto mb-4 text-red-400" />
    <h2 class="text-2xl font-bold">Error Loading Profile</h2>
    <p class="text-gray-500 mb-4">{{ error }}</p>
    <UButton @click="loadUserData" color="primary">Try Again</UButton>
  </div>
  
  <div v-else-if="user" class="container mx-auto px-4 py-8">
    <!-- User Header -->
    <UCard class="mb-8">
      <template #header>
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 class="text-3xl font-bold">{{ user.name }}</h1>
            <p class="text-gray-500">{{ user.email }}</p>
            <div class="flex gap-3 mt-2">
              <UButton
                color="primary"
                variant="ghost"
                size="sm"
                icon="i-lucide-github"
                :to="socialLinks.github"
                target="_blank"
              >
                GitHub
              </UButton>
              <UButton
                color="primary"
                variant="ghost"
                size="sm"
                icon="i-lucide-linkedin"
                :to="socialLinks.linkedin"
                target="_blank"
              >
                LinkedIn
              </UButton>
            </div>
          </div>
          <div class="flex flex-col items-end">
            <div class="flex gap-4">
              <UStatistic :value="user.totalPoints?.toString() || '0'" label="Total Points" />
              <UStatistic :value="user.totalSubmissions?.toString() || '0'" label="Submissions" />
            </div>
          </div>
        </div>
      </template>
    </UCard>

    <!-- Achievements -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-4">Achievements</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UCard 
          v-for="achievement in achievements" 
          :key="achievement.name"
          :ui="{ 
            body: 'p-0'
          }"
          :class="achievement.achieved ? 'border-primary-500 dark:border-primary-400' : 'border-gray-200 dark:border-gray-700'"
        >
          <div class="p-4 flex items-center gap-4" :class="achievement.achieved ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-gray-50 dark:bg-gray-800/50'">
            <div :class="achievement.achieved ? 'bg-primary-100 dark:bg-primary-800 text-primary-500 dark:text-primary-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'" class="p-3 rounded-full">
              <UIcon :name="achievement.achieved ? 'i-lucide-award' : 'i-lucide-circle'" class="text-xl" />
            </div>
            <div>
              <h3 class="font-medium text-base">{{ achievement.name }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ achievement.description }}</p>
            </div>
          </div>
          <div v-if="achievement.achieved" class="px-4 py-2 border-t border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-300 text-sm font-medium">
            Achieved
          </div>
          <div v-else class="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
            Not yet achieved
          </div>
        </UCard>
      </div>
    </div>

    <!-- Tabs for Submissions and Redemptions -->
    <div class="mb-8">
      <div class="border-b border-gray-200 dark:border-gray-700 mb-4">
        <nav class="flex space-x-8">
          <button
            @click="activeTab = 'submissions'"
            class="py-4 px-1 border-b-2 font-medium text-sm"
            :class="activeTab === 'submissions' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
          >
            Submissions
          </button>
          <button
            @click="activeTab = 'redemptions'"
            class="py-4 px-1 border-b-2 font-medium text-sm"
            :class="activeTab === 'redemptions' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
          >
            Redemptions
          </button>
        </nav>
      </div>
      
      <!-- Submissions Tab -->
      <div v-if="activeTab === 'submissions'">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">All Submissions</h2>
          <UInput v-model="searchQuery" placeholder="Search submissions" icon="i-lucide-search" class="max-w-xs" />
        </div>
        
        <UTable
          :columns="submissionColumns"
          :data="allSubmissions"
          v-model:global-filter="searchQuery"
          :ui="{
            base: 'overflow-hidden border-2 border-gray-300 dark:border-gray-700 rounded-lg shadow',
            thead: 'bg-gray-50 dark:bg-gray-800',
            th: 'border-b border-gray-200 dark:border-gray-700 text-lg',
            td: 'border-b border-gray-200 dark:border-gray-700 text-lg',
          }"
        >
          <template #empty>
            <div class="text-center p-4 text-gray-500">
              No submissions found
            </div>
          </template>
        </UTable>
      </div>
      
      <!-- Redemptions Tab -->
      <div v-if="activeTab === 'redemptions'">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">Redemption History</h2>
        </div>
        
        <div v-if="userRedemptions.length === 0" class="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <UIcon name="i-heroicons-shopping-bag" class="text-4xl mx-auto mb-4 text-gray-400" />
          <h3 class="text-lg font-medium mb-2">No Redemptions Yet</h3>
          <p class="text-gray-500 mb-4">You haven't redeemed any rewards yet.</p>
          <UButton to="/store" color="primary">Visit Store</UButton>
        </div>
        
        <UTable
          v-else
          :columns="redemptionColumns"
          :data="userRedemptions"
          :ui="{
            base: 'overflow-hidden border-2 border-gray-300 dark:border-gray-700 rounded-lg shadow',
            thead: 'bg-gray-50 dark:bg-gray-800',
            th: 'border-b border-gray-200 dark:border-gray-700 text-lg',
            td: 'border-b border-gray-200 dark:border-gray-700 text-lg',
          }"
        >
          <template #empty>
            <div class="text-center p-4 text-gray-500">
              No redemptions found
            </div>
          </template>
        </UTable>
      </div>
    </div>
  </div>
  <div v-else class="container mx-auto px-4 py-8 text-center">
    <UIcon name="i-lucide-user-x" class="text-6xl mx-auto mb-4 text-gray-400" />
    <h2 class="text-2xl font-bold">User not found</h2>
    <p class="text-gray-500 mb-4">The requested user profile could not be found.</p>
    <UButton to="/" color="primary">Return to Home</UButton>
  </div>
</template> 