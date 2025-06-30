import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Participant, Submission } from '../types';
import { UserService } from '../services/userService';
import { SubmissionService } from '../services/submissionService';

export const useLeaderboardStore = defineStore('leaderboard', () => {
  const data = ref<Participant[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const lastFetch = ref<number | null>(null);
  
  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  const shouldRefetch = computed(() => {
    if (!lastFetch.value) return true;
    return Date.now() - lastFetch.value > CACHE_DURATION;
  });

  async function fetchLeaderboardData(force = false) {
    if (!force && !shouldRefetch.value && data.value.length > 0) {
      return data.value;
    }

    try {
      isLoading.value = true;
      error.value = null;
      
      const users = await UserService.getAllUsers();
      const allSubmissions = await SubmissionService.getAllSubmissions();
      
      const participants: Participant[] = users.map(user => {
        const userSubmissions = allSubmissions.filter(sub => sub.submittedBy === user.email);
        
        const submissions: Submission[] = userSubmissions.map(sub => ({
          date: sub.submittedAt,
          type: sub.eventTitle,
          points: sub.points || 0,
          status: (sub.status === 'approved' ? 'Approved' : 
                   sub.status === 'rejected' ? 'Rejected' : 'Pending') as 'Approved' | 'Pending' | 'Rejected',
          url: sub.formData?.githubUrl || sub.formData?.projectUrl || sub.formData?.articleUrl || sub.formData?.materialsUrl || '#'
        }));
        
        return {
          email: user.email,
          name: user.name,
          totalSubmissions: user.totalSubmissions,
          totalPoints: user.totalPoints,
          profileUrl: `/profile/${encodeURIComponent(user.email)}`,
          submissions
        };
      });
      
      data.value = participants;
      lastFetch.value = Date.now();
      return participants;
    } catch (err) {
      console.error('Error loading leaderboard data:', err);
      error.value = 'Failed to load leaderboard data';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function clearCache() {
    data.value = [];
    lastFetch.value = null;
    error.value = null;
  }

  return {
    data,
    isLoading,
    error,
    fetchLeaderboardData,
    clearCache
  };
});