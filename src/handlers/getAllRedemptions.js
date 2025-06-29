const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
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
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify(sortedRedemptions)
    };
  } catch (error) {
    console.error('Get all redemptions error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};