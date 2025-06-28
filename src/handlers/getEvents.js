const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const status = event.queryStringParameters?.status;
    const eventType = event.queryStringParameters?.eventType;
    
    let params = {
      TableName: process.env.EVENTS_TABLE
    };
    
    // Add filters if provided
    let filterExpressions = [];
    let expressionAttributeValues = {};
    
    if (status) {
      filterExpressions.push('#status = :status');
      expressionAttributeValues[':status'] = status;
    }
    
    if (eventType) {
      filterExpressions.push('eventType = :eventType');
      expressionAttributeValues[':eventType'] = eventType;
    }
    
    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(' AND ');
      params.ExpressionAttributeValues = expressionAttributeValues;
      
      if (status) {
        params.ExpressionAttributeNames = {
          '#status': 'status'
        };
      }
    }
    
    const result = await dynamoDB.send(new ScanCommand(params));
    
    // Sort events by date (newest first)
    const sortedEvents = result.Items.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify(sortedEvents)
    };
  } catch (error) {
    console.error('Get events error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};