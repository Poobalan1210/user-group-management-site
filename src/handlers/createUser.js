const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { getCorsHeaders } = require('../utils/cors');

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: ''
    };
  }

  try {
    const body = JSON.parse(event.body);
    
    // Check if user already exists by email
    const checkParams = {
      TableName: process.env.USERS_TABLE,
      Key: {
        email: body.email
      }
    };
    
    const existingUser = await dynamoDB.send(new GetCommand(checkParams));
    
    if (existingUser.Item) {
      // User already exists, return existing user
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify(existingUser.Item)
      };
    }
    
    // Create new user with email as primary key
    const params = {
      TableName: process.env.USERS_TABLE,
      Item: {
        email: body.email, // Use email as primary key
        name: body.name,
        linkedinUrl: body.linkedinUrl || '',
        githubUrl: body.githubUrl || '',
        totalPoints: 0,
        totalSubmissions: 0,
        createdAt: body.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    
    await dynamoDB.send(new PutCommand(params));
    
    return {
      statusCode: 201,
      headers: getCorsHeaders(),
      body: JSON.stringify(params.Item)
    };
  } catch (error) {
    console.error('Create user error:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};