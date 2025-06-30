const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
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
    const submissionId = event.pathParameters?.submissionId;
    
    if (!submissionId) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(),
        body: JSON.stringify({ message: 'Missing submissionId parameter' })
      };
    }
    
    const params = {
      TableName: process.env.SUBMISSIONS_TABLE,
      Key: {
        submissionId: submissionId
      }
    };
    
    await dynamoDB.send(new DeleteCommand(params));
    
    return {
      statusCode: 204,
      headers: getCorsHeaders()
    };
  } catch (error) {
    console.error('Delete submission error:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};