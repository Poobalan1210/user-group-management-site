const { SFNClient, StartExecutionCommand } = require('@aws-sdk/client-sfn');
const { getCorsHeaders } = require('../utils/cors');

const sfnClient = new SFNClient();

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: ''
    };
  }

  try {
    const body = JSON.parse(event.body);
    
    // Prepare the input for the Step Function
    const stepFunctionInput = {
      eventTitle: body.eventTitle,
      schemaId: body.schemaId,
      schemaName: body.schemaName,
      formData: body.formData,
      submittedAt: body.submittedAt || new Date().toISOString(),
      submittedBy: body.submittedBy,
      fileUrl: body.fileUrl || ''
    };
    
    // Start the Step Function execution
    const executionName = `submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const params = {
      stateMachineArn: process.env.SUBMISSION_PROCESSING_STATE_MACHINE_ARN,
      name: executionName,
      input: JSON.stringify(stepFunctionInput)
    };
    
    const command = new StartExecutionCommand(params);
    const result = await sfnClient.send(command);
    
    console.log('Step Function execution started:', result.executionArn);
    
    return {
      statusCode: 202,
      headers: getCorsHeaders(),
      body: JSON.stringify({
        message: 'Submission processing started',
        executionArn: result.executionArn,
        executionName: executionName
      })
    };
  } catch (error) {
    console.error('Trigger submission processing error:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ 
        message: 'Failed to start submission processing',
        error: error.message 
      })
    };
  }
};