import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Stat } from '../types';
import { UserService } from '../services/userService';
import { SubmissionService } from '../services/submissionService';
import { events } from '../data/events';

export const useStatsStore = defineStore('stats', () => {
  const stats = ref<Stat[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const lastFetch = ref<number | null>(null);
  
  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  const shouldRefetch = computed(() => {
    if (!lastFetch.value) return true;
    return Date.now() - lastFetch.value > CACHE_DURATION;
  });

  async function fetchStats(force = false) {
    if (!force && !shouldRefetch.value && stats.value.length > 0) {
      return stats.value;
    }

    try {
      isLoading.value = true;
      error.value = null;
      
      const [submissionStats, users] = await Promise.all([
        SubmissionService.getSubmissionStats(),
        UserService.getAllUsers()
      ]);
      
      const activeEvents = events.filter(event => event.status === 'live').length;
      const totalUsers = users.length;
      const totalSubmissions = submissionStats.totalSubmissions;
      const totalPoints = submissionStats.totalPoints;
      
      stats.value = [
        {
          title: "Total Submissions",
          value: totalSubmissions,
          icon: "i-lucide-file-text",
          color: "green",
          trend: `${submissionStats.pendingSubmissions} pending review`,
        },
        {
          title: "Total Users",
          value: totalUsers,
          icon: "i-lucide-users",
          color: "indigo",
          trend: "Active community members",
        },
        {
          title: "Points Awarded",
          value: totalPoints,
          icon: "i-lucide-award",
          color: "amber",
          trend: `${submissionStats.approvedSubmissions} approved submissions`,
        },
        {
          title: "Active Events",
          value: activeEvents,
          icon: "i-lucide-trophy",
          color: "green",
          trend: "Live events available",
        },
      ];
      
      lastFetch.value = Date.now();
      return stats.value;
    } catch (err) {
      console.error('Error loading stats data:', err);
      error.value = 'Failed to load statistics';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function clearCache() {
    stats.value = [];
    lastFetch.value = null;
    error.value = null;
  }

  return {
    stats,
    isLoading,
    error,
    fetchStats,
    clearCache
  };
});