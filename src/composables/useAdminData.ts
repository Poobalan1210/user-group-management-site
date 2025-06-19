import { ref } from 'vue';
import type { FormSubmission } from '../types';

export function useAdminData() {
  const submissions = ref<FormSubmission[]>([
    {
      id: "1",
      name: "James Anderson",
      email: "james.anderson@example.com",
      event: "AWS Lambda Serverless Workshop",
      type: "Workshop",
      date: "2024-03-11T15:30:00",
      content: "This workshop was incredibly helpful in understanding serverless architecture. I learned how to create efficient Lambda functions and integrate them with API Gateway.",
      link: "https://aws.amazon.com/lambda/serverless-workshop",
      aiAnalysis: {
        relevance: 85,
        quality: 90,
        originality: 75,
        summary: "The submission provides a detailed account of implementing serverless architecture using AWS Lambda. The participant demonstrates good understanding of core concepts and practical implementation."
      },
      adminReview: {
        points: 0,
        feedback: "",
        status: "Pending"
      }
    },
    {
      id: "2",
      name: "Mia White",
      email: "mia.white@example.com",
      event: "Cloud Security Bootcamp",
      type: "Challenge",
      date: "2024-03-10T14:20:00",
      content: "The bootcamp covered essential security practices for AWS. I implemented a secure authentication system using Cognito and IAM roles as part of the hands-on exercise.",
      link: "https://aws.amazon.com/security/bootcamp",
      aiAnalysis: {
        relevance: 95,
        quality: 85,
        originality: 80,
        summary: "This submission focuses on AWS security implementations, specifically around Cognito and IAM. The content is highly relevant to the event topic and demonstrates practical application of security concepts."
      },
      adminReview: {
        points: 85,
        feedback: "Excellent work on implementing the security concepts. Your approach to IAM roles was particularly well thought out.",
        status: "Approved"
      }
    },
    {
      id: "3",
      name: "William Brown",
      email: "william.brown@example.com",
      event: "Serverless Application Challenge",
      type: "Project",
      date: "2024-03-08T09:20:00",
      content: "For this challenge, I created a serverless application that processes images using Lambda and stores them in S3. The application uses API Gateway for the frontend integration.",
      link: "https://aws.amazon.com/serverless/challenge",
      aiAnalysis: {
        relevance: 70,
        quality: 65,
        originality: 60,
        summary: "The submission describes a basic serverless image processing application. While it covers the required components, it lacks depth in explaining the architecture decisions and optimization strategies."
      },
      adminReview: {
        points: 50,
        feedback: "Your implementation meets the basic requirements, but we'd like to see more consideration of performance optimization and error handling.",
        status: "Approved"
      }
    },
    {
      id: "4",
      name: "Emma Davis",
      email: "emma.davis@example.com",
      event: "DynamoDB Data Modeling Workshop",
      type: "Workshop",
      date: "2024-03-06T14:45:00",
      content: "This workshop helped me understand how to design efficient data models in DynamoDB. I created a sample application that demonstrates single-table design patterns.",
      link: "https://aws.amazon.com/dynamodb/workshop",
      aiAnalysis: {
        relevance: 90,
        quality: 85,
        originality: 70,
        summary: "The submission shows good understanding of DynamoDB data modeling principles. The participant has successfully implemented single-table design patterns and explained their approach clearly."
      },
      adminReview: {
        points: 0,
        feedback: "",
        status: "Pending"
      }
    },
    {
      id: "5",
      name: "Ethan Harris",
      email: "ethan.harris@example.com",
      event: "CloudFormation Templates Workshop",
      type: "Article",
      date: "2024-03-04T10:30:00",
      content: "I learned how to create reusable CloudFormation templates. My submission includes a template for deploying a three-tier web application with proper security groups.",
      link: "https://aws.amazon.com/cloudformation/workshop",
      aiAnalysis: {
        relevance: 60,
        quality: 55,
        originality: 50,
        summary: "The submission covers basic CloudFormation template creation but lacks details on advanced features like nested stacks or custom resources. The template provided is functional but could benefit from more robust error handling."
      },
      adminReview: {
        points: 0,
        feedback: "The template structure needs improvement. Please review best practices for CloudFormation templates and resubmit.",
        status: "Rejected"
      }
    }
  ]);

  return {
    submissions
  };
} 