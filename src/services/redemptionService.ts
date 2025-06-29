import { apiPost, apiGet } from '../api/api';
import { UserService } from './userService';

export interface ShippingInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  size?: string;
}

export interface RedemptionRequest {
  productId: string;
  productName: string;
  points: number;
  userEmail: string;
  shippingInfo: ShippingInfo | null;
  redemptionDate: string;
}

export interface Redemption {
  redemptionId: string;
  productId: string;
  productName: string;
  points: number;
  userEmail: string;
  shippingInfo: ShippingInfo | null;
  status: 'pending' | 'processed' | 'shipped' | 'delivered' | 'cancelled';
  redemptionDate: string;
  processedDate?: string;
}

export const RedemptionService = {
  // Redeem a product
  redeemProduct: async (redemptionData: RedemptionRequest): Promise<Redemption> => {
    try {
      // First, check if user has enough points
      const user = await UserService.getUserByEmail(redemptionData.userEmail);
      
      if (!user || user.totalPoints < redemptionData.points) {
        throw new Error('Not enough points to redeem this product');
      }
      
      // Create redemption record
      const redemption = await apiPost<Redemption>('/redemptions', redemptionData);
      
      // Update user points
      await UserService.updateUser(redemptionData.userEmail, {
        totalPoints: user.totalPoints - redemptionData.points
      });
      
      return redemption;
    } catch (error) {
      console.error('Error redeeming product:', error);
      throw error;
    }
  },

  // Get user's redemption history
  getUserRedemptions: async (userEmail: string): Promise<Redemption[]> => {
    return await apiGet<Redemption[]>(`/redemptions/user/${userEmail}`);
  },

  // Get all redemptions (admin only)
  getAllRedemptions: async (): Promise<Redemption[]> => {
    return await apiGet<Redemption[]>('/redemptions');
  },
  
  // Get redemption by ID
  getRedemption: async (redemptionId: string): Promise<Redemption> => {
    return await apiGet<Redemption>(`/redemptions/${redemptionId}`);
  }
};