const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const email = event.pathParameters.email;
    const body = JSON.parse(event.body);
    
    // First check if user exists
    const getParams = {
      TableName: process.env.USERS_TABLE,
      Key: {
        email: email
      }
    };
    
    const getResult = await dynamoDB.send(new GetCommand(getParams));
    
    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'User not found' })
      };
    }
    
    const user = getResult.Item;
    
    const params = {
      TableName: process.env.USERS_TABLE,
      Key: {
        email: email
      },
      UpdateExpression: 'set #name = :name, linkedinUrl = :linkedinUrl, githubUrl = :githubUrl, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': body.name || user.name,
        ':linkedinUrl': body.linkedinUrl || user.linkedinUrl || '',
        ':githubUrl': body.githubUrl || user.githubUrl || '',
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };
    
    const result = await dynamoDB.send(new UpdateCommand(params));
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result.Attributes)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};