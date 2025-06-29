const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const userEmail = event.pathParameters?.email;
    
    if (!userEmail) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Missing email parameter' })
      };
    }
    
    const params = {
      TableName: process.env.REDEMPTIONS_TABLE,
      FilterExpression: 'userEmail = :userEmail',
      ExpressionAttributeValues: {
        ':userEmail': userEmail
      }
    };
    
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
    console.error('Get user redemptions error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};