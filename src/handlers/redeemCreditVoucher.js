const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand, ScanCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

// Initialize clients with region
const client = new DynamoDBClient({
  region: process.env.AWS_REGION
});
const dynamoDB = DynamoDBDocumentClient.from(client);
const sqsClient = new SQSClient({
  region: process.env.AWS_REGION
});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    // Validate required fields
    if (!body.userEmail) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({ message: 'Missing required field: userEmail' })
      };
    }

    // If code is provided, use it directly, otherwise find an available one for the specified product
    let item;

    if (body.productName) {
      // First, let's do a simple scan to see all items (for debugging)
      const debugScanParams = {
        TableName: process.env.CREDITS_VOUCHERS_TABLE,
        Limit: 5
      };

      try {
        const debugResult = await dynamoDB.send(new ScanCommand(debugScanParams));
        console.log('Debug scan - all items:', JSON.stringify(debugResult.Items, null, 2));
        console.log('Debug scan - count:', debugResult.Count);
      } catch (debugError) {
        console.error('Debug scan error:', debugError);
      }

      // Find an available credit/voucher for the specified product
      const scanParams = {
        TableName: process.env.CREDITS_VOUCHERS_TABLE,
        FilterExpression: '#isRedeemed = :isRedeemed AND #productName = :productName',
        ExpressionAttributeNames: {
          '#isRedeemed': 'isRedeemed',
          '#productName': 'productName'
        },
        ExpressionAttributeValues: {
          ':isRedeemed': false,
          ':productName': body.productName
        },
        Limit: 10 // Limit results for better performance
      };

      console.log('Scanning with params:', JSON.stringify(scanParams, null, 2));
      console.log('Looking for productName:', body.productName);

      // Use scan operation to find items by non-key attributes
      const result = await dynamoDB.send(new ScanCommand(scanParams));

      console.log('Scan result count:', result.Count);
      console.log('Scan result items:', JSON.stringify(result.Items, null, 2));

      if (!result.Items || result.Items.length === 0) {
        return {
          statusCode: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
          },
          body: JSON.stringify({ message: `No available items found for product: ${body.productName}` })
        };
      }

      // Select a random item from the available ones
      const randomIndex = Math.floor(Math.random() * result.Items.length);
      item = result.Items[randomIndex];

      console.log('Selected item:', JSON.stringify(item, null, 2));
    } else if (body.code) {
      // If a specific code is provided, get that item first
      const getParams = {
        TableName: process.env.CREDITS_VOUCHERS_TABLE,
        Key: {
          code: body.code
        }
      };

      const getResult = await dynamoDB.send(new GetCommand(getParams));

      if (!getResult.Item) {
        return {
          statusCode: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
          },
          body: JSON.stringify({ message: `Code not found: ${body.code}` })
        };
      }

      if (getResult.Item.isRedeemed) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
          },
          body: JSON.stringify({ message: `Code already redeemed: ${body.code}` })
        };
      }

      item = getResult.Item;
    } else {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({ message: 'Either code or productName must be provided' })
      };
    }

    // Update the item to mark as redeemed
    const currentTime = new Date().toISOString();

    let updateParams;

    try {
      updateParams = {
        TableName: process.env.CREDITS_VOUCHERS_TABLE,
        Key: {
          code: item.code
        },
        UpdateExpression: 'SET #isRedeemed = :isRedeemed, #redeemedBy = :redeemedBy, #redeemedAt = :redeemedAt, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#isRedeemed': 'isRedeemed',
          '#redeemedBy': 'redeemedBy',
          '#redeemedAt': 'redeemedAt',
          '#updatedAt': 'updatedAt'
        },
        ExpressionAttributeValues: {
          ':isRedeemed': true,
          ':redeemedBy': body.userEmail,
          ':redeemedAt': currentTime,
          ':updatedAt': currentTime,
          ':currentRedeemed': false
        },
        ConditionExpression: '#isRedeemed = :currentRedeemed',
        ReturnValues: 'ALL_NEW'
      };

    } catch (paramError) {
      console.error('Error while building updateParams:', paramError);
      throw paramError;
    }



    const updateResult = await dynamoDB.send(new UpdateCommand(updateParams));
    const updatedItem = updateResult.Attributes;
    console.log('Update result:', JSON.stringify(updatedItem, null, 2));

    // Also create an entry in the redemptions table
    try {
      const redemptionId = uuidv4();
      const redemptionItem = {
        redemptionId: redemptionId,
        productName: updatedItem.productName,
        userEmail: body.userEmail,
        userName: body.userName || body.userEmail,
        redemptionDate: currentTime,
        createdAt: currentTime,
        updatedAt: currentTime,
        type: updatedItem.type
      };

      const redemptionParams = {
        TableName: process.env.REDEMPTIONS_TABLE,
        Item: redemptionItem
      };

      await dynamoDB.send(new PutCommand(redemptionParams));
      console.log('Created redemption record:', redemptionId);
    } catch (redemptionError) {
      console.error('Error creating redemption record:', redemptionError);
      // Don't fail the process if redemption record creation fails
    }

    const pointsToDeduct = updatedItem.type === 'credit' ? 500 : 800;

    const updateUserParams = {
      TableName: process.env.USERS_TABLE,
      Key: {
        email: body.userEmail
      },
      UpdateExpression: 'set totalPoints = totalPoints - :points, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':points': pointsToDeduct,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'UPDATED_NEW'
    };

    await dynamoDB.send(new UpdateCommand(updateUserParams));

    // Send email notification via SQS
    try {
      // Get user details
      const userParams = {
        TableName: process.env.USERS_TABLE,
        Key: {
          email: body.userEmail
        }
      };

      const userResult = await dynamoDB.send(new GetCommand(userParams));
      const user = userResult.Item;
      console.log('User details:', JSON.stringify(userResult, null, 2));

      // Prepare email data
      const emailData = {
        userEmail: body.userEmail,
        userName: user.name,
        code: updatedItem.code,
        type: updatedItem.type,
        productName: updatedItem.productName,
        redeemedAt: updatedItem.redeemedAt
      };

      // Send to SQS queue
      const sqsParams = {
        QueueUrl: process.env.REDEMPTION_EMAIL_QUEUE_URL,
        MessageBody: JSON.stringify(emailData),
        MessageAttributes: {
          EmailType: {
            DataType: 'String',
            StringValue: 'credit_voucher_redemption'
          }
        }
      };

      console.log('Sending email notification to SQS with params:', JSON.stringify(sqsParams, null, 2));

      await sqsClient.send(new SendMessageCommand(sqsParams));
      console.log(`Redemption email request queued for ${body.userEmail}`);
    } catch (emailError) {
      // Log error but don't fail the redemption process
      console.error('Error queuing email notification:', emailError);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        message: 'Credit/voucher redeemed successfully',
        item: updatedItem
      })
    };
  } catch (error) {
    console.error('Redeem credit/voucher error:', error);

    // Handle specific DynamoDB errors
    if (error.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 409,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({ message: 'This code has already been redeemed' })
      };
    }

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};