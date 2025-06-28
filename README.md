# User Group Management Site

A serverless application for managing AWS user groups, events, and member contributions.

## Setup

### 1. Deploy Cognito User Pool

Deploy the Cognito User Pool using the CloudFormation template:

```bash
aws cloudformation deploy \
  --template-file cognito-user-pool.yaml \
  --stack-name user-group-management-auth \
  --capabilities CAPABILITY_IAM
```

### 2. Get Cognito User Pool details

```bash
aws cloudformation describe-stacks \
  --stack-name user-group-management-auth \
  --query "Stacks[0].Outputs"
```

### 3. Update .env file

Create a `.env` file in the root directory with the following content:

```
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=<UserPoolId from CloudFormation output>
VITE_USER_POOL_CLIENT_ID=<UserPoolClientId from CloudFormation output>
VITE_COGNITO_DOMAIN=<CognitoDomain from CloudFormation output>
VITE_API_ENDPOINT=<API Gateway endpoint>
VITE_ADMIN_EMAILS=admin@example.com,another-admin@example.com
```

> Note: The `VITE_ADMIN_EMAILS` variable contains a comma-separated list of email addresses that will have admin privileges.

### 4. Install dependencies

```bash
npm install
```

### 5. Run the application

```bash
npm run dev
```

## Features

- User authentication with AWS Cognito
- User profile with name, email, LinkedIn URL, and GitHub URL
- Event management
- Member contributions tracking
- Leaderboard