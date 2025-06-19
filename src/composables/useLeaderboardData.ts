import { ref } from 'vue';
import type { Participant } from '../types';

export function useLeaderboardData() {
  const data = ref<Participant[]>([
    {
        id: "1",
        rank: 1,
        name: "James Anderson",
        email: "james.anderson@example.com",
        totalSubmissions: 12,
        totalPoints: 594,
        profileUrl: "https://awsug.madurai/profile/james.anderson",
        submissions: [
          {
            date: "2024-03-11T15:30:00",
            name: "AWS Lambda Serverless Guide",
            type: "Article",
            points: 75,
            status: "Approved",
            url: "https://awsug.madurai/submissions/lambda-guide"
          },
          {
            date: "2024-03-05T10:15:00",
            name: "S3 Storage Solutions",
            type: "Project",
            points: 120,
            status: "Approved",
            url: "https://awsug.madurai/submissions/s3-solutions"
          },
          {
            date: "2024-02-28T09:45:00",
            name: "EC2 Performance Workshop",
            type: "Workshop",
            points: 95,
            status: "Approved",
            url: "https://awsug.madurai/submissions/ec2-workshop"
          }
        ]
      },
      {
        id: "2",
        rank: 2,
        name: "Mia White",
        email: "mia.white@example.com",
        totalSubmissions: 9,
        totalPoints: 486,
        profileUrl: "https://awsug.madurai/profile/mia.white",
        submissions: [
          {
            date: "2024-03-10T14:20:00",
            name: "AWS Cloud Security Best Practices",
            type: "Article",
            points: 85,
            status: "Approved",
            url: "https://awsug.madurai/submissions/security-best-practices"
          },
          {
            date: "2024-03-01T11:30:00",
            name: "Serverless Chat Application",
            type: "Project",
            points: 130,
            status: "Approved",
            url: "https://awsug.madurai/submissions/serverless-chat"
          },
          {
            date: "2024-02-15T16:45:00",
            name: "DynamoDB Challenge",
            type: "Challenge",
            points: 60,
            status: "Pending",
            url: "https://awsug.madurai/submissions/dynamodb-challenge"
          }
        ]
      },
      {
        id: "3",
        rank: 3,
        name: "William Brown",
        email: "william.brown@example.com",
        totalSubmissions: 8,
        totalPoints: 415,
        profileUrl: "https://awsug.madurai/profile/william.brown",
        submissions: [
          {
            date: "2024-03-08T09:20:00",
            name: "Elastic Beanstalk Tutorial",
            type: "Article",
            points: 70,
            status: "Approved",
            url: "https://awsug.madurai/submissions/beanstalk-tutorial"
          },
          {
            date: "2024-02-25T13:10:00",
            name: "CloudFormation Templates",
            type: "Project",
            points: 110,
            status: "Approved",
            url: "https://awsug.madurai/submissions/cloudformation-templates"
          },
          {
            date: "2024-02-10T10:30:00",
            name: "API Gateway Integration",
            type: "Workshop",
            points: 85,
            status: "Rejected",
            url: "https://awsug.madurai/submissions/api-gateway"
          }
        ]
      },
      {
        id: "4",
        rank: 4,
        name: "Emma Davis",
        email: "emma.davis@example.com",
        totalSubmissions: 7,
        totalPoints: 329,
        profileUrl: "https://awsug.madurai/profile/emma.davis",
        submissions: [
          {
            date: "2024-03-06T14:45:00",
            name: "CloudWatch Monitoring Guide",
            type: "Article",
            points: 75,
            status: "Approved",
            url: "https://awsug.madurai/submissions/cloudwatch-guide"
          },
          {
            date: "2024-02-20T11:15:00",
            name: "Serverless REST API",
            type: "Project",
            points: 120,
            status: "Approved",
            url: "https://awsug.madurai/submissions/serverless-api"
          },
          {
            date: "2024-02-05T16:30:00",
            name: "SNS/SQS Integration Challenge",
            type: "Challenge",
            points: 65,
            status: "Pending",
            url: "https://awsug.madurai/submissions/sns-sqs-challenge"
          }
        ]
      },
      {
        id: "5",
        rank: 5,
        name: "Ethan Harris",
        email: "ethan.harris@example.com",
        totalSubmissions: 6,
        totalPoints: 287,
        profileUrl: "https://awsug.madurai/profile/ethan.harris",
        submissions: [
          {
            date: "2024-03-04T10:30:00",
            name: "AWS Lambda Functions in Python",
            type: "Article",
            points: 70,
            status: "Approved",
            url: "https://awsug.madurai/submissions/lambda-python"
          },
          {
            date: "2024-02-18T15:45:00",
            name: "Cognito Authentication System",
            type: "Project",
            points: 125,
            status: "Approved",
            url: "https://awsug.madurai/submissions/cognito-auth"
          },
          {
            date: "2024-02-02T09:15:00",
            name: "ECS Container Workshop",
            type: "Workshop",
            points: 90,
            status: "Rejected",
            url: "https://awsug.madurai/submissions/ecs-workshop"
          }
        ]
      }
  ]);

  const expanded = ref({});
  const globalFilter = ref("");

  function getDetailData(row: any) {
    return row.submissions || [];
  }

  return {
    data,
    expanded,
    globalFilter,
    getDetailData
  };
}
