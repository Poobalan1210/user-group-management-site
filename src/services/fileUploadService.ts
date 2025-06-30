import { secureImageUploadService } from './secureImageUpload';

class FileUploadService {
  /**
   * Uploads a file to S3 using the secure image upload service
   * This service works for any file type, not just images
   */
  async uploadFile(file: File, folder: string = 'submissions'): Promise<string> {
    try {
      // Validate file size (max 5MB)
      if (file.size > 100 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }
      
      // Use the existing secure image upload service
      // This works for any file type, not just images
      const fileUrl = await secureImageUploadService.uploadImage(file, folder);
      return fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }
}

export const fileUploadService = new FileUploadService();