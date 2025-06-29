const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);
const sqsClient = new SQSClient();

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const redemptionId = uuidv4();
    
    // Validate required fields
    if (!body.productId || !body.productName || !body.points || !body.userEmail) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({ message: 'Missing required fields' })
      };
    }
    
    // Check if user exists and has enough points
    const userParams = {
      TableName: process.env.USERS_TABLE,
      Key: {
        email: body.userEmail
      }
    };
    
    const userResult = await dynamoDB.send(new GetCommand(userParams));
    
    if (!userResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'User not found' })
      };
    }
    
    const user = userResult.Item;
    
    if (user.totalPoints < body.points) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Not enough points' })
      };
    }
    
    // Create redemption record
    const redemptionItem = {
      redemptionId: redemptionId,
      productId: body.productId,
      productName: body.productName,
      points: body.points,
      userEmail: body.userEmail,
      userName: user.name,
      shippingInfo: body.shippingInfo || null,
      status: 'pending',
      redemptionDate: body.redemptionDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const params = {
      TableName: process.env.REDEMPTIONS_TABLE,
      Item: redemptionItem
    };
    
    await dynamoDB.send(new PutCommand(params));
    
    // Update user's points
    const updateUserParams = {
      TableName: process.env.USERS_TABLE,
      Key: {
        email: body.userEmail
      },
      UpdateExpression: 'set totalPoints = totalPoints - :points, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':points': body.points,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'UPDATED_NEW'
    };
    
    await dynamoDB.send(new UpdateCommand(updateUserParams));
    
    // For digital products, send email notification via SQS
    if (!body.shippingInfo) {
      try {
        // Send message to SQS queue for email processing
        const sqsParams = {
          QueueUrl: process.env.REDEMPTION_EMAIL_QUEUE_URL,
          MessageBody: JSON.stringify(redemptionItem),
          MessageAttributes: {
            EmailType: {
              DataType: 'String',
              StringValue: 'redemption_confirmation'
            }
          }
        };
        
        await sqsClient.send(new SendMessageCommand(sqsParams));
        console.log(`Redemption email request queued for ${body.userEmail}`);
      } catch (sqsError) {
        // Log error but don't fail the redemption process
        console.error('Error queuing email notification:', sqsError);
      }
    }
    
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify(redemptionItem)
    };
  } catch (error) {
    console.error('Create redemption error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};