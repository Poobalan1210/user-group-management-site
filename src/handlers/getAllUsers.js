const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { getCorsHeaders } = require('../utils/cors');

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const params = {
      TableName: process.env.USERS_TABLE
    };
    
    const result = await dynamoDB.send(new ScanCommand(params));
    
    // Sort users by total points (descending)
    const sortedUsers = result.Items.sort((a, b) => b.totalPoints - a.totalPoints);
    
    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: JSON.stringify(sortedUsers)
    };
  } catch (error) {
    console.error('Get all users error:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};