const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
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
    const status = event.queryStringParameters?.status;
    
    let params = {
      TableName: process.env.REDEMPTIONS_TABLE
    };
    
    // Add filter for status if provided
    if (status) {
      params.FilterExpression = '#status = :status';
      params.ExpressionAttributeValues = {
        ':status': status
      };
      params.ExpressionAttributeNames = {
        '#status': 'status'
      };
    }
    
    const result = await dynamoDB.send(new ScanCommand(params));
    
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
    console.error('Get all redemptions error:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};