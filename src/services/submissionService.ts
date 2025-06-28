import { apiPost, apiGet, apiPut } from '../api/api';

export interface ChallengeSubmission {
  submissionId?: string;
  eventTitle: string;
  schemaId: string;
  schemaName: string;
  formData: Record<string, any>;
  submissionType?: string;
  submittedAt: string;
  submittedBy?: string; // User email/ID
  status?: 'pending' | 'approved' | 'rejected';
  points?: number;
  feedback?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubmissionStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  totalPoints: number;
  submissionsByEvent: Record<string, number>;
  submissionsByType: Record<string, number>;
  recentSubmissions: ChallengeSubmission[];
}

export const SubmissionService = {
  // Submit a challenge form
  submitChallenge: async (submission: ChallengeSubmission): Promise<ChallengeSubmission> => {
    return await apiPost<ChallengeSubmission>('/submissions', submission);
  },

  // Get submissions for a user
  getUserSubmissions: async (userId: string): Promise<ChallengeSubmission[]> => {
    return await apiGet<ChallengeSubmission[]>(`/submissions/user/${userId}`);
  },

  // Get all submissions (admin only)
  getAllSubmissions: async (filters?: { status?: string, eventTitle?: string }): Promise<ChallengeSubmission[]> => {
    let url = '/submissions';
    const queryParams = [];
    
    if (filters?.status) {
      queryParams.push(`status=${encodeURIComponent(filters.status)}`);
    }
    
    if (filters?.eventTitle) {
      queryParams.push(`eventTitle=${encodeURIComponent(filters.eventTitle)}`);
    }
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    return await apiGet<ChallengeSubmission[]>(url);
  },
  
  // Get a specific submission by ID
  getSubmission: async (submissionId: string): Promise<ChallengeSubmission> => {
    return await apiGet<ChallengeSubmission>(`/submissions/${submissionId}`);
  },
  
  // Update a submission (admin only)
  updateSubmission: async (submissionId: string, updates: { status?: string, points?: number, feedback?: string }): Promise<ChallengeSubmission> => {
    return await apiPut<ChallengeSubmission>(`/submissions/${submissionId}`, updates);
  },
  
  // Get submission statistics (admin only)
  getSubmissionStats: async (): Promise<SubmissionStats> => {
    return await apiGet<SubmissionStats>('/submissions/stats');
  },
  
  // Delete a submission (admin only)
  deleteSubmission: async (submissionId: string): Promise<void> => {
    return await apiDelete<void>(`/submissions/${submissionId}`);
  }
};