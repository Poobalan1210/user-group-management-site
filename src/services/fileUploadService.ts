import { secureImageUploadService } from './secureImageUpload';

class FileUploadService {
  private getMimeType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    const mimeTypes: Record<string, string> = {
      'md': 'text/markdown',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'rtf': 'application/rtf',
      'odt': 'application/vnd.oasis.opendocument.text'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  async uploadFile(file: File, folder: string = 'submissions'): Promise<string> {
    try {
      if (file.size > 100 * 1024 * 1024) {
        throw new Error('File size must be less than 100MB');
      }
      
      let processedFile = file;
      if (!file.type || file.type === '') {
        processedFile = new File([file], file.name, {
          type: this.getMimeType(file.name),
          lastModified: file.lastModified
        });
      }
      
      const fileUrl = await secureImageUploadService.uploadImage(processedFile, folder);
      return fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }
}

export const fileUploadService = new FileUploadService();