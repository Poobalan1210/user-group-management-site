const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  try {
    console.log('Analyzing content with Bedrock:', JSON.stringify(event, null, 2));
    
    // Extract content based on processing type
    let contentToAnalyze = '';
    let contentType = '';


    
    // Check for blog processing result - Fixed path
    if (event.blogProcessingResult?.Payload?.processedData) {
      contentType = 'Blog Post';
      const blogData = event.blogProcessingResult.Payload.processedData;      
      contentToAnalyze = `Title: ${blogData.title || 'N/A'}
Content: ${blogData.content || 'N/A'}`;
    } 
    // Check for video processing result
    else if (event.videoProcessingResult?.Payload?.processedData) {
      contentType = 'Video Tutorial';
      const videoData = event.videoProcessingResult.Payload.processedData;
      const formData = event.formData || event.Payload?.formData;
      
      contentToAnalyze = `Title: ${videoData.title || 'N/A'}
Description: ${videoData.description || 'N/A'}
Platform: ${videoData.platform || 'N/A'}
Duration: ${videoData.duration || 'N/A'}
Submission Type: ${formData?.submission_type || 'N/A'}
Project URL: ${formData?.projectUrl || 'N/A'}`;
    }
    
    console.log('Content Type:', contentType);
    console.log('Content to Analyze:', contentToAnalyze);
    
    if (!contentToAnalyze.trim()) {
      console.warn('No content found, checking event structure...');
      console.log('Event keys:', Object.keys(event));
      
      // Log the structure to help debug
      if (event.blogProcessingResult) {
        console.log('Blog processing result keys:', Object.keys(event.blogProcessingResult));
        if (event.blogProcessingResult.Payload) {
          console.log('Blog payload keys:', Object.keys(event.blogProcessingResult.Payload));
        }
      }
      
      throw new Error('No content found to analyze');
    }
    
    // Use direct prompt template
    const promptTemplate = `Analyze the following {{contentType}} submission and provide scores (0-100) for relevance, quality, and originality. Also provide a brief summary. Content to analyze: {{contentToAnalyze}} Please respond in the following JSON format: { "relevance": <score 0-100>, "quality": <score 0-100>, "originality": <score 0-100>, "summary": "<brief analysis summary>" }`;
    
    // Replace placeholders in prompt template
    const prompt = promptTemplate
      .replace(/\{\{contentType\}\}/g, contentType)
      .replace(/\{\{contentToAnalyze\}\}/g, contentToAnalyze);

    console.log('Final Prompt:', prompt);
    
    // Call Bedrock Claude model
    const modelId = 'us.anthropic.claude-3-5-sonnet-20240620-v1:0';
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
      console.log('Raw AI Response:', aiResponse);
      
      // Try multiple JSON extraction methods
      let jsonStr = null;
      
      // Method 1: Look for complete JSON object
      const jsonMatch = aiResponse.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      } else {
        // Method 2: Look for JSON between code blocks or quotes
        const codeBlockMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1].trim();
        } else {
          // Method 3: Try to find any JSON-like structure
          const simpleMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (simpleMatch) {
            jsonStr = simpleMatch[0];
          }
        }
      }
      
      if (jsonStr) {
        analysisResult = JSON.parse(jsonStr);
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