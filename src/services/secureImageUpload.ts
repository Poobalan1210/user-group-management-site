import axios from 'axios';

class SecureImageUploadService {
  private apiEndpoint: string;

  constructor() {
    this.apiEndpoint = import.meta.env.VITE_API_ENDPOINT || '';
  }

  async uploadImage(file: File, folder: string = 'checkpoints'): Promise<string> {
    try {
      console.log('Upload request:', {
        fileName: file.name,
        fileType: file.type,
        folder,
        fileSize: file.size
      });

      // Step 1: Get presigned URL
      const response = await axios.post(`${this.apiEndpoint}/upload`, {
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        folder,
      });

      const { presignedUrl, imageUrl } = response.data;

      // Step 2: Upload file to S3
      await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });

      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error.response) {
        console.error('API Error Response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      throw new Error(`Failed to upload image: ${error.response?.data?.message || error.message}`);
    }
  }
}

export const secureImageUploadService = new SecureImageUploadService();