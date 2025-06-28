export type Submission = {
    date: string;
    name: string;
    type: 'Article' | 'Project' | 'Challenge' | 'Workshop';
    points: number;
    status: 'Approved' | 'Pending' | 'Rejected';
    url: string;
  };
  
  export type Participant = {
    email: string;
    name: string;
    totalSubmissions: number;
    totalPoints: number;
    profileUrl: string;
    submissions: Submission[];
  };
  
  export type Stat = {
    title: string;
    value: number;
    icon: string;
    color: string;
    trend: string;
  };

export type FormSubmission = {
  id: string;
  name: string;
  email: string;
  event: string;
  type: 'Article' | 'Project' | 'Challenge' | 'Workshop';
  date: string;
  content: string;
  link: string;
  aiAnalysis: {
    relevance: number;
    quality: number;
    originality: number;
    summary: string;
  };
  adminReview: {
    points: number;
    feedback: string;
    status: 'Pending' | 'Approved' | 'Rejected';
  };
};
