const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand, GetCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
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
    const eventId = event.pathParameters?.eventId;
    const date = event.queryStringParameters?.date;
    
    if (!eventId) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(),
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
          headers: getCorsHeaders(),
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
      headers: getCorsHeaders()
    };
  } catch (error) {
    console.error('Delete event error:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};