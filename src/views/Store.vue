<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../auth/authStore';
import { UserService } from '../services/userService';
import { RedemptionService } from '../services/redemptionService';
import RedemptionModal from '../components/RedemptionModal.vue';

const authStore = useAuthStore();
const isLoading = ref(true);
const userPoints = ref(0);
const products = ref([
  {
    id: 'aws-credits',
    name: 'AWS Credits',
    description: 'Get $100 AWS credits to use on your AWS account',
    image: 'https://d1.awsstatic.com/logos/aws-logo-lockups/poweredbyaws/PB_AWS_logo_RGB_stacked_REV_SQ.91cd4af40773cbfbd15577a3c2b8a346fe3e8fa2.png',
    points: 500,
    type: 'digital',
    available: true
  },
  {
    id: 'certification-voucher',
    name: 'AWS Certification Voucher',
    description: 'Voucher for any AWS certification exam',
    image: 'https://d1.awsstatic.com/training-and-certification/certification-badges/AWS-Certified-Cloud-Practitioner_badge.634f8a21af2e0e956ed8905a72366146ba22b74c.png',
    points: 800,
    type: 'digital',
    available: true
  }
]);

const selectedProduct = ref();
const showConfirmationModal = ref(false);
const redemptionSuccess = ref(false);
const redemptionError = ref('');
const redemptionInProgress = ref(false);
const shippingInfo = ref({
  name: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  size: 'M' // Default size for t-shirts
});

// Load user points
onMounted(async () => {
  if (authStore.isAuthenticated && authStore.user) {
    try {
      const email = authStore.user.attributes?.email;
      if (email) {
        const userData = await UserService.getUserByEmail(email);
        userPoints.value = userData.totalPoints || 0;
      }
    } catch (error) {
      console.error('Error loading user points:', error);
    } finally {
      isLoading.value = false;
    }
  } else {
    isLoading.value = false;
  }
});

const canAfford = computed(() => {
  return (product) => userPoints.value >= product.points;
});

const selectProduct = (product) => {
  selectedProduct.value = product;
  showConfirmationModal.value = true;
  
  // Reset form data
  redemptionSuccess.value = false;
  redemptionError.value = '';
};

const closeModal = () => {
  console.log('Closing modal');
  showConfirmationModal.value = false;
  selectedProduct.value = null;
  redemptionSuccess.value = false;
  redemptionError.value = '';
  redemptionInProgress.value = false;
};

const needsShippingInfo = computed(() => {
  return false; // All products are digital now
});

const isFormValid = computed(() => {
  if (!selectedProduct.value) return false;
  return true; // All products are digital now, no additional validation needed
});

const redeemProduct = async () => {
  if (!authStore.isAuthenticated || !selectedProduct.value) {
    redemptionError.value = 'You must be logged in to redeem products';
    return;
  }
  
  if (!canAfford.value(selectedProduct.value)) {
    redemptionError.value = 'You do not have enough points for this product';
    return;
  }
  
  if (needsShippingInfo.value && !isFormValid.value) {
    redemptionError.value = 'Please fill in all shipping information';
    return;
  }
  
  redemptionInProgress.value = true;
  redemptionError.value = '';
  
  try {
    const email = authStore.user.attributes?.email;
    if (!email) throw new Error('User email not found');
    
    await RedemptionService.redeemProduct({
      productId: selectedProduct.value.id,
      productName: selectedProduct.value.name,
      points: selectedProduct.value.points,
      userEmail: email,
      shippingInfo: needsShippingInfo.value ? shippingInfo.value : null,
      redemptionDate: new Date().toISOString()
    });
    
    // Update user points locally
    userPoints.value -= selectedProduct.value.points;
    
    // Show success message
    redemptionSuccess.value = true;
  } catch (error) {
    console.error('Error redeeming product:', error);
    redemptionError.value = 'Failed to redeem product. Please try again.';
  } finally {
    redemptionInProgress.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Rewards Store</h1>
      <div v-if="authStore.isAuthenticated" class="flex items-center">
        <UIcon name="i-heroicons-star" class="text-yellow-500 mr-2" />
        <span class="text-xl font-semibold">{{ userPoints }} Points</span>
      </div>
    </div>
    
    <div v-if="isLoading" class="text-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="text-4xl animate-spin mx-auto mb-4" />
      <p class="text-gray-500">Loading store...</p>
    </div>
    
    <div v-else-if="!authStore.isAuthenticated" class="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <UIcon name="i-heroicons-lock-closed" class="text-4xl mx-auto mb-4" />
      <h2 class="text-2xl font-bold mb-2">Sign In Required</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">You need to sign in to view and redeem rewards</p>
      <UButton to="/auth" color="primary">Sign In</UButton>
    </div>
    
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <UCard v-for="product in products" :key="product.id" class="product-card max-w-xs">
          <template #header>
            <div class="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-3">
              <img :src="product.image" :alt="product.name" class="max-h-24 max-w-full object-contain" />
            </div>
          </template>
          
          <div class="p-3">
            <div class="mb-1">
              <h3 class="text-base font-bold">{{ product.name }}</h3>
            </div>
            
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">{{ product.description }}</p>
            
            <UButton 
                color="warning" 
                :disabled="!canAfford(product)"
                @click="selectProduct(product)"
                icon="i-heroicons-currency-dollar"
                class="w-full flex justify-center items-center gap-2"
                variant="subtle"
              >
              {{ product.points }}
              </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </div>
  
  <!-- Redemption Confirmation Modal using Teleport -->
  <Teleport to="body">
    <RedemptionModal
      :is-open="showConfirmationModal"
      :product="selectedProduct"
      :user-points="userPoints"
      :redemption-success="redemptionSuccess"
      :redemption-error="redemptionError"
      :redemption-in-progress="redemptionInProgress"
      @close="closeModal"
      @redeem="redeemProduct"
    />
  </Teleport>
</template>

<style scoped>
.product-card {
  transition: transform 0.2s ease-in-out;
}

.product-card:hover {
  transform: translateY(-5px);
}
</style>