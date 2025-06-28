const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const eventId = event.pathParameters?.eventId;
    
    if (!eventId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({ message: 'Missing eventId parameter' })
      };
    }

    const body = JSON.parse(event.body);
    
    // First check if event exists
    const getParams = {
      TableName: process.env.EVENTS_TABLE,
      Key: {
        eventId: eventId,
        date: body.date || new Date().toISOString().split('T')[0]
      }
    };
    
    const existingEvent = await dynamoDB.send(new GetCommand(getParams));
    
    if (!existingEvent.Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Event not found' })
      };
    }
    
    // Build update expression
    let updateExpression = 'set updatedAt = :updatedAt';
    let expressionAttributeValues = {
      ':updatedAt': new Date().toISOString()
    };
    
    // Add fields to update if provided
    if (body.title) {
      updateExpression += ', title = :title';
      expressionAttributeValues[':title'] = body.title;
    }
    
    if (body.description) {
      updateExpression += ', description = :description';
      expressionAttributeValues[':description'] = body.description;
    }
    
    if (body.status) {
      updateExpression += ', #status = :status';
      expressionAttributeValues[':status'] = body.status;
    }
    
    if (body.eventType) {
      updateExpression += ', eventType = :eventType';
      expressionAttributeValues[':eventType'] = body.eventType;
    }
    
    if (body.tags) {
      updateExpression += ', tags = :tags';
      expressionAttributeValues[':tags'] = body.tags;
    }
    
    if (body.challengeFormSchema) {
      updateExpression += ', challengeFormSchema = :challengeFormSchema';
      expressionAttributeValues[':challengeFormSchema'] = body.challengeFormSchema;
    }
    
    if (body.meetupLink) {
      updateExpression += ', meetupLink = :meetupLink';
      expressionAttributeValues[':meetupLink'] = body.meetupLink;
    }
    
    if (body.checkpoints) {
      updateExpression += ', checkpoints = :checkpoints';
      expressionAttributeValues[':checkpoints'] = body.checkpoints;
    }
    
    if (body.resources) {
      updateExpression += ', resources = :resources';
      expressionAttributeValues[':resources'] = body.resources;
    }
    
    const updateParams = {
      TableName: process.env.EVENTS_TABLE,
      Key: {
        eventId: eventId,
        date: existingEvent.Item.date
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ReturnValues: 'ALL_NEW'
    };
    
    const result = await dynamoDB.send(new UpdateCommand(updateParams));
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify(result.Attributes)
    };
  } catch (error) {
    console.error('Update event error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};