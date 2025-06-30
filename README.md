# AWS User Group Management Site

A comprehensive serverless web application built for managing AWS User Group activities, submissions, and rewards. This application leverages multiple AWS services to provide a scalable, secure, and intelligent platform for community management.

## 🏗️ Architecture Overview

![Architecture Diagram](/images/Architecture.png)

This application follows a serverless architecture pattern using AWS services:

- **Frontend**: Vue.js 3 with Nuxt UI components
- **Backend**: AWS Lambda functions with Node.js 18.x runtime
- **Database**: Amazon DynamoDB for data persistence
- **Authentication**: Amazon Cognito for user management
- **File Storage**: Amazon S3 for image uploads
- **Email Service**: Amazon SES for automated notifications
- **Message Queue**: Amazon SQS for asynchronous email processing
- **AI Analysis**: Amazon Bedrock for content analysis
- **Orchestration**: AWS Step Functions for complex workflows
- **API Gateway**: RESTful API endpoints
- **Infrastructure**: AWS SAM (Serverless Application Model)

## 🚀 Features and Functionality

### Core Features

#### 1. **User Management System**
- User registration and authentication via Amazon Cognito
- Profile management with LinkedIn and GitHub integration
- Role-based access control (Admin/User)
- Secure user data storage in DynamoDB

#### 2. **Event Management**
- Create, update, and delete community events
- Event-specific submission tracking
- Date-based event organization
- Admin-controlled event lifecycle

#### 3. **Intelligent Submission Processing**
- Multi-type content submission (Blog Posts, Video Tutorials)
- AI-powered content analysis using Amazon Bedrock
- Automated quality scoring (Relevance, Quality, Originality)
- Step Functions orchestrated processing workflow

#### 4. **Admin Dashboard**
- Real-time submission review interface
- AI analysis insights and recommendations
- Manual approval/rejection workflow
- Points allocation system
- Comprehensive submission statistics

#### 5. **Rewards & Gamification**
- Points-based reward system
- Credits and vouchers management
- Automated redemption emails via SQS/SES
- Leaderboard functionality
- Store interface for reward redemption

#### 6. **File Management**
- Secure image upload to S3
- Public access configuration for user avatars
- CORS-enabled bucket for web uploads

## 🔧 AWS Lambda Functions Usage

The application extensively uses AWS Lambda for serverless compute, with **25+ Lambda functions** handling different aspects:

### User Management Functions
- **CreateUserFunction**: Handles new user registration
- **GetUserFunction**: Retrieves user profile data
- **GetUserByEmailFunction**: Email-based user lookup
- **GetAllUsersFunction**: Admin user listing
- **UpdateUserFunction**: Profile updates and modifications

### Event Management Functions
- **GetEventsFunction**: Fetches community events
- **CreateEventFunction**: Creates new events (Admin only)
- **UpdateEventFunction**: Modifies existing events
- **DeleteEventFunction**: Removes events from system

### Submission Processing Functions
- **CreateSubmissionFunction**: Initiates submission workflow
- **SaveSubmissionFunction**: Persists submission data
- **ProcessVideoTutorialFunction**: Handles video content processing
- **ProcessBlogPostFunction**: Processes blog post submissions
- **AnalyzeContentFunction**: AI-powered content analysis using Bedrock
- **GetSubmissionFunction**: Individual submission retrieval
- **GetSubmissionsFunction**: Bulk submission queries
- **UpdateSubmissionFunction**: Admin review updates
- **GetSubmissionStatsFunction**: Analytics and statistics
- **DeleteSubmissionFunction**: Submission removal

### Rewards & Store Functions
- **UploadCreditsVouchersFunction**: Bulk upload of rewards
- **GetCreditsVouchersFunction**: Available rewards listing
- **RedeemCreditVoucherFunction**: Handles reward redemption
- **GetAllRedemptionsFunction**: Admin redemption tracking
- **GetUserRedemptionsFunction**: User-specific redemption history
- **SendRedemptionEmailFunction**: Automated email notifications

### Utility Functions
- **UploadImageFunction**: Secure file upload to S3
- **TriggerSubmissionProcessingFunction**: Step Functions orchestration

## 📋 Complete AWS Services List

### Core Services
1. **AWS Lambda** - Serverless compute for all backend logic
2. **Amazon API Gateway** - RESTful API endpoints with CORS support
3. **Amazon DynamoDB** - NoSQL database with 5 tables:
   - Users Table (email-based primary key)
   - Events Table (eventId + date composite key)
   - Submissions Table (with user index)
   - Redemptions Table (with user email index)
   - Credits/Vouchers Table (with type index)

### Authentication & Security
4. **Amazon Cognito** - User authentication and authorization
5. **AWS IAM** - Role-based access control with least privilege

### Storage & Content
6. **Amazon S3** - Image storage with public read access
7. **Amazon SES** - Email delivery service for notifications

### AI & Analytics
8. **Amazon Bedrock** - AI content analysis using Claude 3.5 Sonnet
9. **AWS Step Functions** - Complex workflow orchestration

### Messaging & Queuing
10. **Amazon SQS** - Asynchronous email processing queue

### Infrastructure
11. **AWS SAM** - Infrastructure as Code deployment
12. **AWS CloudFormation** - Resource provisioning and management

## 🔄 Step Functions Workflow

The submission processing uses AWS Step Functions for intelligent workflow orchestration:

```
1. SaveSubmission → 2. CheckSubmissionType → 3a. ProcessVideoTutorial
                                          → 3b. ProcessBlogPost
                                          ↓
4. AnalyzeContent (Bedrock AI) → 5. UpdateSubmissionWithAnalysis
```

**Error Handling**: Built-in retry logic and error states for robust processing.

## 🛠️ Technical Implementation

### Lambda Runtime Configuration
- **Runtime**: Node.js 18.x
- **Memory**: 128MB (standard), 256MB (AI functions)
- **Timeout**: 30 seconds (standard), 60 seconds (AI analysis)
- **Environment Variables**: Centralized configuration management

### Database Design
- **Pay-per-request billing** for cost optimization
- **Global Secondary Indexes** for efficient querying
- **Composite keys** for complex data relationships
- **Attribute-based access patterns**

### Security Implementation
- **Least privilege IAM roles** for each function type
- **Resource-specific permissions** (DynamoDB tables, S3 buckets)
- **Cognito integration** for secure authentication
- **CORS configuration** for web application access

## 🚀 Deployment Instructions

### Prerequisites
- AWS CLI configured with appropriate permissions
- AWS SAM CLI installed
- Node.js 18.x or later

### Deployment Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd user-group-management-site
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Lambda function dependencies
   cd src && npm install && cd ..
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Update .env with your AWS configuration
   ```

4. **Deploy with SAM**
   ```bash
   sam build
   sam deploy --guided
   ```

5. **Configure SES**
   - Verify sender email in Amazon SES
   - Update SENDER_EMAIL in template.yaml

6. **Setup Bedrock**
   - Enable Claude 3.5 Sonnet model access
   - Create prompt templates in Bedrock Prompt Management

### Frontend Deployment
```bash
npm run build
# Deploy to your preferred hosting service (Vercel, Netlify, etc.)
```

## 📊 Monitoring and Analytics

The application provides comprehensive analytics through:
- **Submission statistics** (total, pending, approved, rejected)
- **User engagement metrics** via leaderboard
- **Redemption tracking** for reward programs
- **AI analysis insights** for content quality assessment

## 🔐 Security Features

- **Authentication**: Cognito-based user management
- **Authorization**: Role-based access control
- **Data Protection**: Encrypted data at rest and in transit
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Secure cross-origin resource sharing

## 🎯 Use Cases

This application is perfect for:
- **AWS User Groups** managing community activities
- **Tech Communities** running content challenges
- **Educational Institutions** tracking student submissions
- **Corporate Training** programs with gamification
- **Open Source Projects** managing contributions

## 📈 Scalability

The serverless architecture ensures:
- **Automatic scaling** based on demand
- **Pay-per-use** cost model
- **High availability** across multiple AZs
- **Global distribution** capability via CloudFront (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the AWS User Group Madurai team
- Check AWS documentation for service-specific help

---

**Built with ❤️ for the AWS Community using AWS Serverless Technologies**