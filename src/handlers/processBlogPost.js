const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const s3Client = new S3Client({ region: process.env.AWS_REGION});

const downloadFileFromS3 = async (url) => {
  let bucket, key;
  
  if (url.startsWith('s3://')) {
    const urlParts = url.replace('s3://', '').split('/');
    bucket = urlParts[0];
    key = urlParts.slice(1).join('/');
  } else if (url.includes('.s3.') || url.includes('.s3-')) {
    const urlObj = new URL(url);
    bucket = urlObj.hostname.split('.')[0];
    key = decodeURIComponent(urlObj.pathname.substring(1));
  } else {
    throw new Error('Invalid S3 URL format');
  }
  
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3Client.send(command);
  
  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

const extractContent = async (buffer, fileExtension) => {
  switch (fileExtension.toLowerCase()) {
    case '.pdf':
      const pdfData = await pdfParse(buffer);
      return pdfData.text;
    
    case '.docx':
    case '.doc':
      const docResult = await mammoth.extractRawText({ buffer });
      return docResult.value;
    
    case '.md':
      return buffer.toString('utf-8');
    
    default:
      return buffer.toString('utf-8');
  }
};

exports.handler = async (event) => {
  try {
    console.log('Processing Blog Post submission:', JSON.stringify(event, null, 2));
    
    const fileUrl = event.fileUrl;
    let extractedContent = '';
    
    // Download and extract content if fileUrl is an S3 URL
    if (fileUrl && (fileUrl.startsWith('s3://') || fileUrl.includes('.s3.'))) {
      console.log('Downloading file from S3:', fileUrl);
      
      const fileExtension = fileUrl.substring(fileUrl.lastIndexOf('.'));
      const fileBuffer = await downloadFileFromS3(fileUrl);
      extractedContent = await extractContent(fileBuffer, fileExtension);
      
      console.log('Content extracted, length:', extractedContent.length);
    }
    
    // Extract blog-specific data from the submission
    const blogData = {
      submissionId: event.submissionResult?.Payload?.submissionId,
      blogUrl: fileUrl,
      title: event.formData?.eventTitle,
      content: extractedContent || event.formData?.content,
    };
    
    console.log('Blog Post Data processed with content length:', blogData.content?.length || 0);
    
    return {
      statusCode: 200,
      processedData: blogData,
      processingType: 'blog_post',
      context: {
        ...event,
        blogProcessingResult: {
          processed: true,
          timestamp: new Date().toISOString(),
          blogMetadata: blogData,
          contentExtracted: !!extractedContent
        }
      }
    };
  } catch (error) {
    console.error('Process blog post error:', error);
    throw error;
  }
};