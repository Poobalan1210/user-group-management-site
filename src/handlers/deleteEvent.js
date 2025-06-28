const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand, GetCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const eventId = event.pathParameters?.eventId;
    const date = event.queryStringParameters?.date;
    
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
    
    // If date is not provided, we need to get it first
    let eventDate = date;
    if (!eventDate) {
      // Try to find the event by scanning (less efficient but works)
      const scanParams = {
        TableName: process.env.EVENTS_TABLE,
        FilterExpression: 'eventId = :eventId',
        ExpressionAttributeValues: {
          ':eventId': eventId
        }
      };
      
      const scanResult = await dynamoDB.send(new ScanCommand(scanParams));
      if (scanResult.Items && scanResult.Items.length > 0) {
        eventDate = scanResult.Items[0].date;
      } else {
        return {
          statusCode: 404,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ message: 'Event not found' })
        };
      }
    }
    
    const params = {
      TableName: process.env.EVENTS_TABLE,
      Key: {
        eventId: eventId,
        date: eventDate
      }
    };
    
    await dynamoDB.send(new DeleteCommand(params));
    
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      }
    };
  } catch (error) {
    console.error('Delete event error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};