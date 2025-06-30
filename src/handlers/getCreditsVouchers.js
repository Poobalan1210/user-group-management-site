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
    const type = event.queryStringParameters?.type;
    const status = event.queryStringParameters?.status;
    
    if (!type || (type !== 'credit' && type !== 'voucher')) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(),
        body: JSON.stringify({ message: 'Type parameter is required and must be either "credit" or "voucher"' })
      };
    }
    
    // Query by type using the GSI
    const queryParams = {
      TableName: process.env.CREDITS_VOUCHERS_TABLE,
      IndexName: 'TypeIndex',
      KeyConditionExpression: '#type = :type',
      ExpressionAttributeNames: {
        '#type': 'type'
      },
      ExpressionAttributeValues: {
        ':type': type
      }
    };
    
    // Add filter for redemption status if provided
    if (status === 'redeemed' || status === 'available') {
      queryParams.FilterExpression = 'isRedeemed = :isRedeemed';
      queryParams.ExpressionAttributeValues[':isRedeemed'] = (status === 'redeemed');
    }
    
    const result = await dynamoDB.send(new QueryCommand(queryParams));
    
    // Sort by creation date (newest first)
    const sortedItems = result.Items.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: JSON.stringify(sortedItems)
    };
  } catch (error) {
    console.error('Get credits/vouchers error:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};