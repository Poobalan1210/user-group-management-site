const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const submissionId = event.pathParameters?.submissionId;
    
    if (!submissionId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({ message: 'Missing submissionId parameter' })
      };
    }

    const body = JSON.parse(event.body);
    
    // First, check if the submission exists
    const getParams = {
      TableName: process.env.SUBMISSIONS_TABLE,
      Key: {
        submissionId: submissionId
      }
    };
    
    const existingSubmission = await dynamoDB.send(new GetCommand(getParams));
    
    if (!existingSubmission.Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Submission not found' })
      };
    }
    
    // Build update expression and attribute values based on provided fields
    let updateExpression = 'set updatedAt = :updatedAt';
    let expressionAttributeValues = {
      ':updatedAt': new Date().toISOString()
    };
    
    // Add status if provided
    if (body.status) {
      updateExpression += ', #status = :status';
      expressionAttributeValues[':status'] = body.status;
    }
    
    // Add points if provided
    if (body.points !== undefined) {
      updateExpression += ', points = :points';
      expressionAttributeValues[':points'] = body.points;
    }
    
    // Add feedback if provided
    if (body.feedback) {
      updateExpression += ', feedback = :feedback';
      expressionAttributeValues[':feedback'] = body.feedback;
    }
    
    // Update the submission
    const updateParams = {
      TableName: process.env.SUBMISSIONS_TABLE,
      Key: {
        submissionId: submissionId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: {
        '#status': 'status' // 'status' is a reserved word in DynamoDB
      },
      ReturnValues: 'ALL_NEW'
    };
    
    const result = await dynamoDB.send(new UpdateCommand(updateParams));
    
    // If submission is approved, update user's total points and submissions count
    if (body.status === 'approved' && body.points) {
      try {
        // Get the user by email (now primary key)
        const userParams = {
          TableName: process.env.USERS_TABLE,
          Key: {
            email: existingSubmission.Item.submittedBy
          }
        };
        
        const userResult = await dynamoDB.send(new GetCommand(userParams));
        
        if (userResult.Item) {
          const user = userResult.Item;
          
          // Update user's points and submission count
          const updateUserParams = {
            TableName: process.env.USERS_TABLE,
            Key: {
              email: user.email
            },
            UpdateExpression: 'set totalPoints = totalPoints + :points, totalSubmissions = totalSubmissions + :count, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
              ':points': body.points,
              ':count': 1,
              ':updatedAt': new Date().toISOString()
            }
          };
          
          await dynamoDB.send(new UpdateCommand(updateUserParams));
        }
      } catch (userError) {
        console.error('Error updating user stats:', userError);
        // Continue with the submission update even if user update fails
      }
    }
    
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
    console.error('Update submission error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};