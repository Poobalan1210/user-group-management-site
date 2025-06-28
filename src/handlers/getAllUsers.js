const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const params = {
      TableName: process.env.USERS_TABLE
    };
    
    const result = await dynamoDB.send(new ScanCommand(params));
    
    // Sort users by total points (descending) and assign ranks
    const sortedUsers = result.Items.sort((a, b) => b.totalPoints - a.totalPoints);
    const usersWithRanks = sortedUsers.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify(usersWithRanks)
    };
  } catch (error) {
    console.error('Get all users error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};