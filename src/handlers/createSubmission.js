const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const submissionId = uuidv4();
    
    // Extract submission type from form data if available
    let submissionType = 'Challenge';
    if (body.formData && body.formData.category) {
      submissionType = body.formData.category;
    } else if (body.formData && body.formData.type) {
      submissionType = body.formData.type;
    }
    
    // Create submission record
    const params = {
      TableName: process.env.SUBMISSIONS_TABLE,
      Item: {
        submissionId: submissionId,
        eventTitle: body.eventTitle,
        schemaId: body.schemaId,
        schemaName: body.schemaName,
        formData: body.formData,
        submissionType: submissionType,
        submittedAt: body.submittedAt || new Date().toISOString(),
        submittedBy: body.submittedBy,
        status: 'pending',
        points: 0, // Initial points (will be updated by admin)
        feedback: '', // Will be filled by admin
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    
    await dynamoDB.send(new PutCommand(params));
    
    // Update user's submission count in the users table
    try {
      if (body.submittedBy) {
        // Find user by email (now primary key)
        const userParams = {
          TableName: process.env.USERS_TABLE,
          Key: {
            email: body.submittedBy
          }
        };
        
        const userResult = await dynamoDB.send(new GetCommand(userParams));
        
        if (userResult.Item) {
          // User found, update their pending submission count
          const user = userResult.Item;
          
          // We'll increment the total submissions count when the submission is approved
          console.log(`User found: ${user.email}, updating pending submissions count`);
        }
      }
    } catch (userError) {
      // Log error but don't fail the submission creation
      console.error('Error updating user submission count:', userError);
    }
    
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
    console.error('Create submission error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};