import { ref, computed } from 'vue';
import { apiGet, apiPost } from '../api/api';

export interface CreditVoucher {
  type: 'credit' | 'voucher';
  code: string;
  productName: string;
  isRedeemed: boolean;
  redeemedBy?: string;
  redeemedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadCreditsVouchersRequest {
  type: 'credit' | 'voucher';
  items: Array<{
    code: string;
    productName?: string;
  }>;
}

export interface RedeemCreditVoucherRequest {
  productName?: string;
  userEmail: string;
}

// Simple toast implementation
function useToast() {
  return {
    success(message: string) {
      console.log('Success:', message);
      if (window.$toast) {
        window.$toast.add({
          title: 'Success',
          description: message,
          color: 'green'
        });
      }
    },
    error(message: string) {
      console.error('Error:', message);
      if (window.$toast) {
        window.$toast.add({
          title: 'Error',
          description: message,
          color: 'red'
        });
      }
    }
  };
}

class CreditsVouchersManagerService {
  // API methods
  private async uploadCreditsVouchers(data: UploadCreditsVouchersRequest): Promise<any> {
    return await apiPost<any>('/credits-vouchers/upload', data);
  }

  private async getCreditsVouchers(type: 'credit' | 'voucher', status?: 'redeemed' | 'available'): Promise<CreditVoucher[]> {
    let url = `/credits-vouchers?type=${type}`;
    if (status) {
      url += `&status=${status}`;
    }
    return await apiGet<CreditVoucher[]>(url);
  }

  private async redeemCreditVoucher(data: RedeemCreditVoucherRequest): Promise<CreditVoucher> {
    return await apiPost<CreditVoucher>('/credits-vouchers/redeem', data);
  }

  private async getUserRedemptions(email: string): Promise<CreditVoucher[]> {
    return await apiPost<CreditVoucher[]>('/credits-vouchers/user', { email });
  }

  // CSV parsing methods
  private parseCreditsCSV(csvText: string): Array<{ code: string;productName?: string }> {
    const rows = csvText.split('\n');
    const result = [];
    
    // Skip header row if it exists
    const startIndex = rows[0].toLowerCase().includes('code') || 
                       rows[0].toLowerCase().includes('name') ? 1 : 0;
    
    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i].trim();
      if (!row) continue;
      
      const columns = row.split(',');
      if (columns.length >= 2) {
        const code = columns[0].trim();
        const productName = columns[1].trim();
        
        if (code && productName) {
          result.push({ code, productName });
        }
      }
    }
    
    return result;
  }

  private parseVouchersCSV(csvText: string): Array<{ code: string; productName?: string }> {
    const rows = csvText.split('\n');
    const result = [];
    
    // Skip header row if it exists
    const startIndex = rows[0].toLowerCase().includes('code') || 
                       rows[0].toLowerCase().includes('name') ? 1 : 0;
    
    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i].trim();
      if (!row) continue;
      
      const columns = row.split(',');
      if (columns.length >= 2) {
        const code = columns[0].trim();
        const productName = columns[1].trim();
        
        if (code && productName) {
          result.push({ code, productName });
        }
      }
    }
    
    return result;
  }
  private toast = useToast();
  private isLoading = ref(false);
  private creditsCount = ref({ available: 0, redeemed: 0 });
  private vouchersCount = ref({ available: 0, redeemed: 0 });

  // Computed properties for available counts
  get availableCreditsCount() {
    return this.creditsCount.value.available;
  }
  
  get availableVouchersCount() {
    return this.vouchersCount.value.available;
  }
  
  get loading() {
    return this.isLoading.value;
  }
  
  get counts() {
    return {
      credits: this.creditsCount.value,
      vouchers: this.vouchersCount.value
    };
  }
  
  // Fetch credits and vouchers counts from the database
  async fetchCounts() {
    this.isLoading.value = true;
    try {
      // Fetch credits
      const availableCredits = await this.getCreditsVouchers('credit', 'available');
      const redeemedCredits = await this.getCreditsVouchers('credit', 'redeemed');
      
      // Fetch vouchers
      const availableVouchers = await this.getCreditsVouchers('voucher', 'available');
      const redeemedVouchers = await this.getCreditsVouchers('voucher', 'redeemed');
      
      // Update counts
      this.creditsCount.value = {
        available: availableCredits.length,
        redeemed: redeemedCredits.length
      };
      
      this.vouchersCount.value = {
        available: availableVouchers.length,
        redeemed: redeemedVouchers.length
      };
      
      return this.counts;
    } catch (error) {
      console.error('Error fetching credits/vouchers counts:', error);
      this.toast.error('Failed to fetch credits and vouchers information');
      throw error;
    } finally {
      this.isLoading.value = false;
    }
  }

  // Process CSV for credits
  async processCreditsCSV(file: File) {
    this.isLoading.value = true;
    try {
      const text = await file.text();
      const newCredits = this.parseCreditsCSV(text);
      
      if (newCredits.length === 0) {
        this.toast.error('No valid credits found in CSV file');
        return;
      }
      
      // Save to database
      await this.uploadCreditsVouchers({
        type: 'credit',
        items: newCredits
      });
      
      // Refresh counts after upload
      await this.fetchCounts();
      
      this.toast.success(`Successfully imported ${newCredits.length} credits`);
      return newCredits.length;
    } catch (error) {
      console.error('Error processing credits CSV:', error);
      this.toast.error('Failed to process credits CSV file');
      throw error;
    } finally {
      this.isLoading.value = false;
    }
  }

  // Process CSV for vouchers
  async processVouchersCSV(file: File) {
    this.isLoading.value = true;
    try {
      const text = await file.text();
      const newVouchers = this.parseVouchersCSV(text);
      
      if (newVouchers.length === 0) {
        this.toast.error('No valid vouchers found in CSV file');
        return;
      }
      
      // Save to database
      await this.uploadCreditsVouchers({
        type: 'voucher',
        items: newVouchers
      });
      
      // Refresh counts after upload
      await this.fetchCounts();
      
      this.toast.success(`Successfully imported ${newVouchers.length} vouchers`);
      return newVouchers.length;
    } catch (error) {
      console.error('Error processing vouchers CSV:', error);
      this.toast.error('Failed to process vouchers CSV file');
      throw error;
    } finally {
      this.isLoading.value = false;
    }
  }

  // Redeem a credit
  async redeemCredit(userEmail: string, productName?: string) {
    this.isLoading.value = true;
    try {
      // Let the Lambda function select a random available credit for the given product
      const redeemedCredit = await this.redeemCreditVoucher({
        productName,
        userEmail: userEmail
      });
      
      // Refresh counts after redemption
      await this.fetchCounts();
      
      this.toast.success('Credit redeemed successfully');
      return redeemedCredit;
    } catch (error) {
      console.error('Error redeeming credit:', error);
      this.toast.error('Failed to redeem credit');
      return null;
    } finally {
      this.isLoading.value = false;
    }
  }

  // Redeem a voucher
  async redeemVoucher(userEmail: string, productName?: string) {
    this.isLoading.value = true;
    try {
      // Let the Lambda function select a random available voucher for the given product
      const redeemedVoucher = await this.redeemCreditVoucher({
        productName,
        userEmail: userEmail
      });
      
      // Refresh counts after redemption
      await this.fetchCounts();
      
      this.toast.success('Voucher redeemed successfully');
      return redeemedVoucher;
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      this.toast.error('Failed to redeem voucher');
      return null;
    } finally {
      this.isLoading.value = false;
    }
  }

  // Get redemptions for a specific user
  async getRedemptionsByUser(email: string) {
    this.isLoading.value = true;
    try {
      const redemptions = await this.getUserRedemptions(email);
      return redemptions;
    } catch (error) {
      console.error('Error fetching user redemptions:', error);
      this.toast.error('Failed to fetch redemption history');
      return [];
    } finally {
      this.isLoading.value = false;
    }
  }
}

export const creditsVouchersManager = new CreditsVouchersManagerService();