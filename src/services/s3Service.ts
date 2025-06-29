// This service is deprecated - use secureImageUploadService instead
// Kept for backward compatibility only

class S3Service {
  async uploadImage(file: File, folder: string = 'checkpoints'): Promise<string> {
    throw new Error('Direct S3 upload is disabled. Use secureImageUploadService instead.');
  }
}

export const s3Service = new S3Service();