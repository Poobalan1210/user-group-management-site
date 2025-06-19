import { ref } from 'vue';
import type { Stat } from '../types';

export function useStatsData() {
  const stats = ref<Stat[]>([
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
      title: "Active Contests",
      value: 6,
      icon: "i-lucide-trophy",
      color: "green",
      trend: "2 ending soon",
    },
  ]);

  return { stats };
}
