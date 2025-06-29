import axios from 'axios';

class SecureImageUploadService {
  private apiEndpoint: string;

  constructor() {
    this.apiEndpoint = import.meta.env.VITE_API_ENDPOINT || '';
  }

  async uploadImage(file: File, folder: string = 'checkpoints'): Promise<string> {
    try {
      // Step 1: Get presigned URL
      const response = await axios.post(`${this.apiEndpoint}/upload`, {
        fileName: file.name,
        fileType: file.type,
        folder,
      });

      const { presignedUrl, imageUrl } = response.data;

      // Step 2: Upload file to S3
      await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }
}

export const secureImageUploadService = new SecureImageUploadService();