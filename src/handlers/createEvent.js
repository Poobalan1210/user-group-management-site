const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const eventId = uuidv4();
    
    const params = {
      TableName: process.env.EVENTS_TABLE,
      Item: {
        eventId: eventId,
        date: body.date,
        title: body.title,
        description: body.description,
        status: body.status || 'live',
        eventType: body.eventType || 'builders_skill_sprint',
        tags: body.tags || [],
        challengeFormSchema: body.challengeFormSchema || '',
        meetupLink: body.meetupLink || '',
        checkpoints: body.checkpoints || [],
        resources: body.resources || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    
    await dynamoDB.send(new PutCommand(params));
    
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify(params.Item)
    };
  } catch (error) {
    console.error('Create event error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};