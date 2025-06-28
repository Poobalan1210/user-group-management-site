const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const userId = event.pathParameters?.userId;
    const status = event.queryStringParameters?.status;
    const eventTitle = event.queryStringParameters?.eventTitle;
    
    let filterExpressions = [];
    let expressionAttributeValues = {};
    
    // Build filter expressions based on parameters
    if (userId) {
      filterExpressions.push('submittedBy = :userId');
      expressionAttributeValues[':userId'] = userId;
    }
    
    if (status) {
      filterExpressions.push('#status = :status');
      expressionAttributeValues[':status'] = status;
    }
    
    if (eventTitle) {
      filterExpressions.push('eventTitle = :eventTitle');
      expressionAttributeValues[':eventTitle'] = eventTitle;
    }
    
    // Construct the scan parameters
    let params = {
      TableName: process.env.SUBMISSIONS_TABLE
    };
    
    // Add filter expression if any filters are applied
    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(' AND ');
      params.ExpressionAttributeValues = expressionAttributeValues;
      
      // Add expression attribute names if status filter is used
      if (status) {
        params.ExpressionAttributeNames = {
          '#status': 'status' // 'status' is a reserved word in DynamoDB
        };
      }
    }
    
    const result = await dynamoDB.send(new ScanCommand(params));
    
    // Sort by submission date (newest first)
    const sortedSubmissions = result.Items.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify(sortedSubmissions)
    };
  } catch (error) {
    console.error('Get submissions error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};