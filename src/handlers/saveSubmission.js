const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const submissionId = uuidv4();

    // Create submission record
    const submissionItem = {
      submissionId: submissionId,
      eventTitle: event.eventTitle,
      schemaId: event.schemaId,
      schemaName: event.schemaName,
      formData: event.formData,
      submittedAt: event.submittedAt || new Date().toISOString(),
      submittedBy: event.submittedBy,
      status: 'processing',
      points: 0,
      feedback: '',
      fileUrl: event.fileUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const params = {
      TableName: process.env.SUBMISSIONS_TABLE,
      Item: submissionItem
    };
    
    await dynamoDB.send(new PutCommand(params));
    
    return {
      statusCode: 200,
      submissionId: submissionId,
      submissionItem: submissionItem
    };
  } catch (error) {
    console.error('Save submission error:', error);
    throw error;
  }
};