const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { type, items } = body;
    
    if (!type || !items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({ message: 'Invalid request. Type and items array are required.' })
      };
    }
    
    // Validate type
    if (type !== 'credit' && type !== 'voucher') {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Type must be either "credit" or "voucher"' })
      };
    }
    
    // Process and store each item
    const results = [];
    const errors = [];
    
    for (const item of items) {
      try {
        // For credits, we expect code and value
        // For vouchers, we expect code and description
        if (type === 'credit' && (!item.code)) {
          errors.push({ code: item.code, error: 'Missing required fields for credit' });
          continue;
        }
        
        if (type === 'voucher' && (!item.code)) {
          errors.push({ code: item.code, error: 'Missing required fields for voucher' });
          continue;
        }
        
        // Check if code already exists
        const queryParams = {
          TableName: process.env.CREDITS_VOUCHERS_TABLE,
          KeyConditionExpression: 'code = :code',
          ExpressionAttributeValues: {
            ':code': item.code
          }
        };
        
        const existingItem = await dynamoDB.send(new QueryCommand(queryParams));
        
        if (existingItem.Items && existingItem.Items.length > 0) {
          errors.push({ code: item.code, error: 'Code already exists' });
          continue;
        }
        
        // Create the item
        const params = {
          TableName: process.env.CREDITS_VOUCHERS_TABLE,
          Item: {
            code: item.code,
            type: type,
            productName: item.productName,
            isRedeemed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        };
        
        await dynamoDB.send(new PutCommand(params));
        results.push(params.Item);
      } catch (itemError) {
        console.error('Error processing item:', itemError);
        errors.push({ code: item.code, error: itemError.message });
      }
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        message: `Processed ${results.length} items with ${errors.length} errors`,
        results,
        errors
      })
    };
  } catch (error) {
    console.error('Upload credits/vouchers error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};