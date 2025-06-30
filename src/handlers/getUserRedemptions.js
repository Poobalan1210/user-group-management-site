const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { getCorsHeaders } = require('../utils/cors');

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: ''
    };
  }
  
  try {
    // Get email from request body instead of path parameters
    const body = JSON.parse(event.body || '{}');
    const userEmail = body.email;
    
    if (!userEmail) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(),
        body: JSON.stringify({ message: 'Missing email parameter in request body' })
      };
    }
    
    const params = {
      TableName: process.env.REDEMPTIONS_TABLE,
      IndexName: 'UserEmailIndex',
      KeyConditionExpression: 'userEmail = :userEmail',
      ExpressionAttributeValues: {
        ':userEmail': userEmail
      }
    };
    
    const result = await dynamoDB.send(new QueryCommand(params));
    
    // Sort by redemption date (newest first)
    const sortedRedemptions = result.Items.sort((a, b) => 
      new Date(b.redemptionDate).getTime() - new Date(a.redemptionDate).getTime()
    );
    
    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: JSON.stringify(sortedRedemptions)
    };
  } catch (error) {
    console.error('Get user redemptions error:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};