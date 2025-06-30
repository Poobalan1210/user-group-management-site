const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

exports.handler = async (event) => {
  try {
    console.log('Analyzing content with Bedrock:', JSON.stringify(event, null, 2));
    
    // Extract content based on processing type
    let contentToAnalyze = '';
    let contentType = '';
    
    if (event.videoProcessingResult) {
      contentType = 'Video Tutorial';
      const videoData = event.videoProcessingResult.videoMetadata;
      contentToAnalyze = `Title: ${videoData.title || 'N/A'}
Description: ${videoData.description || 'N/A'}
Platform: ${videoData.platform || 'N/A'}
Duration: ${videoData.duration || 'N/A'}`;
    } else if (event.blogProcessingResult) {
      contentType = 'Blog Post';
      const blogData = event.blogProcessingResult.blogMetadata;
      contentToAnalyze = `Title: ${blogData.title || 'N/A'}
Content: ${blogData.content || blogData.excerpt || 'N/A'}
Tags: ${Array.isArray(blogData.tags) ? blogData.tags.join(', ') : blogData.tags || 'N/A'}
Platform: ${blogData.platform || 'N/A'}`;
    }
    
    // Prepare the prompt for Bedrock
    const prompt = `Analyze the following ${contentType} submission and provide scores (0-100) for relevance, quality, and originality. Also provide a brief summary.

Content to analyze:
${contentToAnalyze}

Please respond in the following JSON format:
{
  "relevance": <score 0-100>,
  "quality": <score 0-100>, 
  "originality": <score 0-100>,
  "summary": "<brief analysis summary>"
}`;

    // Call Bedrock Claude model
    const modelId = 'anthropic.claude-3-haiku-20240307-v1:0';
    const requestBody = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    const command = new InvokeModelCommand({
      modelId: modelId,
      body: JSON.stringify(requestBody),
      contentType: 'application/json',
      accept: 'application/json'
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Parse the AI response
    let analysisResult;
    try {
      const aiResponse = responseBody.content[0].text;
      // Extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.warn('Failed to parse AI response, using default values:', parseError);
      analysisResult = {
        relevance: 75,
        quality: 75,
        originality: 75,
        summary: 'Analysis completed with default scoring due to parsing error.'
      };
    }
    
    console.log('AI Analysis Result:', analysisResult);
    
    return {
      statusCode: 200,
      relevance: analysisResult.relevance.toString(),
      quality: analysisResult.quality.toString(),
      originality: analysisResult.originality.toString(),
      summary: analysisResult.summary
    };
  } catch (error) {
    console.error('Analyze content error:', error);
    
    // Return default values if Bedrock fails
    return {
      statusCode: 200,
      relevance: '70',
      quality: '70',
      originality: '70',
      summary: 'Content analysis completed with default scoring due to processing error.'
    };
  }
};