const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { getCorsHeaders } = require('../utils/cors');

const s3Client = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: ''
    };
  }

  try {
    const { fileName, fileType, folder = 'checkpoints' } = JSON.parse(event.body);
    
    if (!fileName || !fileType) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(),
        body: JSON.stringify({ error: 'fileName and fileType are required' })
      };
    }

    const key = `${folder}/${Date.now()}-${fileName}`;
    const bucketName = process.env.IMAGES_BUCKET_NAME;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    const imageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: JSON.stringify({
        presignedUrl,
        imageUrl
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: 'Failed to generate upload URL' })
    };
  }
};