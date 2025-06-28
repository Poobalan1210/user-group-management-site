import { ref, onMounted } from 'vue';
import type { Participant, Submission } from '../types';
import { UserService } from '../services/userService';
import { SubmissionService } from '../services/submissionService';

export function useLeaderboardData() {
  const data = ref<Participant[]>([]);
  const expanded = ref({});
  const globalFilter = ref("");
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  const loadLeaderboardData = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      
      // Get all users
      const users = await UserService.getAllUsers();
      
      // Get all submissions to link with users
      const allSubmissions = await SubmissionService.getAllSubmissions();
      
      // Transform users into participants with their submissions
      const participants: Participant[] = users.map(user => {
        // Find submissions for this user
        const userSubmissions = allSubmissions.filter(sub => sub.submittedBy === user.email);
        
        // Transform submissions to match the expected format
        const submissions: Submission[] = userSubmissions.map(sub => ({
          date: sub.submittedAt,
          name: sub.formData?.projectName || sub.formData?.title || sub.formData?.workshopTitle || 'Unnamed Submission',
          type: (sub.submissionType || 'Challenge') as 'Article' | 'Project' | 'Challenge' | 'Workshop',
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
    } catch (err) {
      console.error('Error loading leaderboard data:', err);
      error.value = 'Failed to load leaderboard data';
      
      // Fallback to mock data if API fails
      data.value = [
        {
          email: "james.anderson@example.com",
          name: "James Anderson",
          totalSubmissions: 12,
          totalPoints: 594,
          profileUrl: "/profile/james.anderson%40example.com",
          submissions: [
            {
              date: "2024-03-11T15:30:00",
              name: "AWS Lambda Serverless Guide",
              type: "Article",
              points: 75,
              status: "Approved",
              url: "https://awsug.madurai/submissions/lambda-guide"
            }
          ]
        }
      ];
    } finally {
      isLoading.value = false;
    }
  };

  function getDetailData(row: any) {
    return row.submissions || [];
  }

  // Load data on mount
  onMounted(() => {
    loadLeaderboardData();
  });

  return {
    data,
    expanded,
    globalFilter,
    isLoading,
    error,
    getDetailData,
    loadLeaderboardData
  };
}
