const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    // Get all submissions
    const params = {
      TableName: process.env.SUBMISSIONS_TABLE
    };
    
    const result = await dynamoDB.send(new ScanCommand(params));
    const submissions = result.Items || [];
    
    // Calculate statistics
    const stats = {
      totalSubmissions: submissions.length,
      pendingSubmissions: submissions.filter(s => s.status === 'pending').length,
      approvedSubmissions: submissions.filter(s => s.status === 'approved').length,
      rejectedSubmissions: submissions.filter(s => s.status === 'rejected').length,
      totalPoints: submissions.reduce((sum, s) => sum + (s.points || 0), 0),
      submissionsByEvent: {},
      submissionsByType: {},
      recentSubmissions: []
    };
    
    // Calculate submissions by event
    submissions.forEach(submission => {
      const eventTitle = submission.eventTitle || 'Unknown Event';
      if (!stats.submissionsByEvent[eventTitle]) {
        stats.submissionsByEvent[eventTitle] = 0;
      }
      stats.submissionsByEvent[eventTitle]++;
      
      // Calculate submissions by type
      const submissionType = submission.submissionType || 'Challenge';
      if (!stats.submissionsByType[submissionType]) {
        stats.submissionsByType[submissionType] = 0;
      }
      stats.submissionsByType[submissionType]++;
    });
    
    // Get recent submissions (last 10)
    stats.recentSubmissions = submissions
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 10)
      .map(s => ({
        submissionId: s.submissionId,
        eventTitle: s.eventTitle,
        submittedBy: s.submittedBy,
        submittedAt: s.submittedAt,
        status: s.status,
        points: s.points || 0
      }));
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify(stats)
    };
  } catch (error) {
    console.error('Get submission stats error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};