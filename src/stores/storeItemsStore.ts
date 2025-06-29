import { defineStore } from 'pinia';
import { ref, computed, onMounted } from 'vue';
import { creditsVouchersManager } from '../services/creditsVouchersManagerService';

export interface Credit {
  id: string;
  code: string;
  value: number;
  isRedeemed: boolean;
  redeemedBy?: string;
  redeemedDate?: Date;
}

export interface Voucher {
  id: string;
  code: string;
  description: string;
  isRedeemed: boolean;
  redeemedBy?: string;
  redeemedDate?: Date;
}

export const useStoreItemsStore = defineStore('storeItems', () => {
  const credits = ref<Credit[]>([]);
  const vouchers = ref<Voucher[]>([]);

  // Computed properties for available counts
  const availableCreditsCount = computed(() => creditsVouchersManager.availableCreditsCount);
  const availableVouchersCount = computed(() => creditsVouchersManager.availableVouchersCount);
  const isLoading = computed(() => creditsVouchersManager.loading);
  
  // Computed properties for counts
  const creditsCount = computed(() => creditsVouchersManager.counts.credits);
  const vouchersCount = computed(() => creditsVouchersManager.counts.vouchers);
  
  // Initialize data
  onMounted(() => {
    fetchCreditsVouchersCounts();
  });

  // Fetch credits and vouchers counts from the database
  const fetchCreditsVouchersCounts = async () => {
    return await creditsVouchersManager.fetchCounts();
  };

  // Function to process CSV for credits
  const processCreditsCSV = async (file: File) => {
    return await creditsVouchersManager.processCreditsCSV(file);
  };

  // Function to process CSV for vouchers
  const processVouchersCSV = async (file: File) => {
    return await creditsVouchersManager.processVouchersCSV(file);
  };

  // Function to redeem a credit
  const redeemCredit = async (userEmail: string, productName:string) => {
    return await creditsVouchersManager.redeemCredit(userEmail, productName);
  };

  // Function to redeem a voucher
  const redeemVoucher = async (userEmail: string, productName:string) => {
    return await creditsVouchersManager.redeemVoucher(userEmail, productName);
  };

  return {
    credits,
    vouchers,
    isLoading,
    availableCreditsCount,
    availableVouchersCount,
    creditsCount,
    vouchersCount,
    processCreditsCSV,
    processVouchersCSV,
    redeemCredit,
    redeemVoucher,
    fetchCreditsVouchersCounts
  };
});