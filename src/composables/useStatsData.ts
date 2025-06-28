import { ref, onMounted } from 'vue';
import type { Stat } from '../types';
import { UserService } from '../services/userService';
import { SubmissionService } from '../services/submissionService';
import { events } from '../data/events';

export function useStatsData() {
  const stats = ref<Stat[]>([]);
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  const loadStatsData = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      
      // Get submission stats and user count in parallel
      const [submissionStats, users] = await Promise.all([
        SubmissionService.getSubmissionStats(),
        UserService.getAllUsers()
      ]);
      
      // Count active events (live events)
      const activeEvents = events.filter(event => event.status === 'live').length;
      
      // Calculate trends (mock for now - you could store historical data)
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
    } catch (err) {
      console.error('Error loading stats data:', err);
      error.value = 'Failed to load statistics';
      
      // Fallback to mock data if API fails
      stats.value = [
        {
          title: "Total Submissions",
          value: 384,
          icon: "i-lucide-file-text",
          color: "green",
          trend: "+12% from last month",
        },
        {
          title: "Total Users",
          value: 1204,
          icon: "i-lucide-users",
          color: "indigo",
          trend: "+5% from last month",
        },
        {
          title: "Points Awarded",
          value: 8642,
          icon: "i-lucide-award",
          color: "amber",
          trend: "+18% from last month",
        },
        {
          title: "Active Events",
          value: 6,
          icon: "i-lucide-trophy",
          color: "green",
          trend: "2 ending soon",
        },
      ];
    } finally {
      isLoading.value = false;
    }
  };

  // Load data on mount
  onMounted(() => {
    loadStatsData();
  });

  return { 
    stats, 
    isLoading, 
    error, 
    loadStatsData 
  };
}
