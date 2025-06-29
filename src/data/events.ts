export interface Checkpoint {
  title: string;
  date: string;
  description: string;
  meetupUrl?: string;
  posterImage?: string;
  youtubeVideoId?: string;
}

export interface Resource {
  title: string;
  link: string;
  type: 'document' | 'video' | 'code' | 'other';
}

export interface Event {
  eventId: string;
  title: string;
  description: string;
  status: 'live' | 'past';
  date: string;
  eventType: 'builders_skill_sprint' | 'virtual_event';
  tags?: string[];
  challengeFormSchema?: string;
  meetupLink?: string;
  checkpoints: Checkpoint[];
  resources: Resource[];
  posterImage?: string;
  youtubeVideoId?: string;
}

export const events: Event[] = [
  {
    eventId: '1',
    title: 'Serverless Hackathon 2023',
    description: 'Build and deploy serverless applications using AWS Lambda, Azure Functions, or Google Cloud Functions.',
    status: 'live',
    date: '2023-11-15',
    eventType: 'builders_skill_sprint',
    tags: ['aws', 'serverless', 'backend'],
    challengeFormSchema: 'project-submission',
    meetupLink: 'https://meetup.com/events/serverless-hackathon',
    checkpoints: [
      {
        title: 'Project Submission',
        date: '2023-11-30',
        description: '🚀 **AWS User Group Madurai | Builders Skill Sprint – June Edition**: 📊 **Data Month**\n\n📍 **Checkpoint 1 – Data Engineering with AWS**\n\nKickstarting our Data Month this June 📅, Checkpoint 1 takes you deep into the world of AWS data pipelines! 🧠💡\n\nAs part of the Builders Skill Sprint 🛠️, this session will introduce you to the foundational concepts of data engineering and guide you through building scalable ⚙️, secure 🔐, and cost-effective 💰 data pipelines using AWS-native services.\n\n🎤 **Session Speaker**: DIPALI KULSHRESTHA\n🔗 **Meeting Link**: [Join Session](https://meet.zoho.in/vugd-cyr-nzn)\n📅 **Date**: June 1, 2025 | 🕙 **Time**: 11:00 AM IST\n\n🔍 **What you\'ll learn in Checkpoint 1**\n• The complete data lifecycle: ingest ➝ transform ➝ store ➝ analyze ➝ visualize\n• Hands-on with services like Amazon S3, Glue, Lambda, Redshift, Athena, and QuickSight\n• Real-world pipeline architectures and best practices for scalability and cost-efficiency\n• Bonus activities like mini-contests, polls, and social challenges during the session 🎯',
        meetupUrl: 'https://meetup.com/events/serverless-checkpoint1',
        posterImage: 'https://placehold.co/600x400?text=Project+Submission',
        youtubeVideoId: 'dQw4w9WgXcQ'
      },
      {
        title: 'Final Presentation',
        date: '2023-12-05',
        description: 'Present your project to judges',
        meetupUrl: 'https://meetup.com/events/serverless-checkpoint2',
        posterImage: 'https://placehold.co/600x400?text=Final+Presentation'
      }
    ],
    resources: [
      {
        title: 'Getting Started with AWS Lambda',
        link: 'https://docs.aws.amazon.com/lambda/latest/dg/getting-started.html',
        type: 'document'
      },
      {
        title: 'Serverless Architecture Tutorial',
        link: 'https://www.youtube.com/watch?v=example',
        type: 'video'
      }
    ]
  },
  {
    eventId: '2',
    title: 'Vue.js Workshop',
    description: 'Learn the fundamentals of Vue.js and build a real-world application.',
    status: 'live',
    date: '2023-12-10',
    eventType: 'virtual_event',
    tags: ['frontend', 'full-stack'],
    meetupLink: 'https://meetup.com/events/vue-workshop',
    posterImage: 'https://placehold.co/600x400?text=Vue.js+Workshop',
    youtubeVideoId: 'nhBVL41-_Cw',
    checkpoints: [],
    resources: [
      {
        title: 'Vue.js Documentation',
        link: 'https://vuejs.org/guide/introduction.html',
        type: 'document'
      },
      {
        title: 'Vue.js Starter Code',
        link: 'https://github.com/example/vue-starter',
        type: 'code'
      }
    ]
  },
  {
    eventId: '3',
    title: 'Web Performance Optimization',
    description: 'Learn techniques to optimize web application performance.',
    status: 'past',
    date: '2023-10-05',
    eventType: 'builders_skill_sprint',
    tags: ['frontend', 'devops'],
    challengeFormSchema: 'basic-submission',
    checkpoints: [
      {
        title: 'Performance Audit',
        date: '2023-10-05',
        description: 'Audit your web application performance',
        meetupUrl: 'https://meetup.com/events/perf-checkpoint1',
        posterImage: 'https://placehold.co/600x400?text=Performance+Audit',
        youtubeVideoId: 'AQqFZ5t8uNc'
      },
      {
        title: 'Optimization Implementation',
        date: '2023-10-12',
        description: 'Implement optimization techniques',
        meetupUrl: 'https://meetup.com/events/perf-checkpoint2',
        posterImage: 'https://placehold.co/600x400?text=Optimization'
      }
    ],
    resources: [
      {
        title: 'Web Performance Best Practices',
        link: 'https://web.dev/performance-best-practices/',
        type: 'document'
      },
      {
        title: 'Performance Optimization Tools',
        link: 'https://github.com/example/performance-tools',
        type: 'code'
      }
    ]
  }
]; 