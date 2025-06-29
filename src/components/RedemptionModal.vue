<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  product: Object,
  userPoints: {
    type: Number,
    default: 0
  },
  redemptionSuccess: Boolean,
  redemptionError: String,
  redemptionInProgress: Boolean
});

const emit = defineEmits(['close', 'redeem']);

const isFormValid = computed(() => {
  if (!props.product) return false;
  return true; // All products are digital now
});

const cancel = () => {
  document.body.style.overflow = "auto"; // Ensure scrolling is restored
  emit("close");
};
</script>

<template>
  <UModal :open="isOpen" :close="{ onClick: cancel }" title="Confirm Redemption" size="md">
    <template #body>
      <div class="p-4 bg-white dark:bg-gray-800 rounded-lg">
        
        <div v-if="redemptionSuccess" class="py-6 text-center">
          <UIcon name="i-heroicons-check-circle" class="text-6xl text-green-500 mx-auto mb-4" />
          <h3 class="text-xl font-bold mb-2">Redemption Successful!</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            You will receive an email with your redemption details shortly.
          </p>
          <UButton color="primary" @click="$emit('close')">Close</UButton>
        </div>
        
        <div v-else-if="product" class="py-4">
          <div class="flex items-center mb-6">
            <img :src="product.image" :alt="product.name" class="w-16 h-16 object-contain mr-4" />
            <div>
              <h4 class="font-bold">{{ product.name }}</h4>
              <div class="flex items-center text-yellow-500">
                <UIcon name="i-heroicons-star" class="mr-1" />
                <span>{{ product.points }} Points</span>
              </div>
            </div>
          </div>
          
          <UAlert v-if="redemptionError" color="error" class="mb-4">
            {{ redemptionError }}
          </UAlert>
          
          <div class="mb-6">
            <p class="text-gray-600 dark:text-gray-400">
              Are you sure you want to redeem <span class="font-bold">{{ product.name }}</span>?
            </p>
            <p class="text-gray-600 dark:text-gray-400 mt-2">
              {{ product.description }}
            </p>
          </div>
          
           <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Your balance after redemption: <span class="font-bold">{{ userPoints - product.points }} Points</span>
              </p>
            </div>

          <div class="flex gap-2 mt-4">
              <UButton 
                color="primary" 
                :loading="redemptionInProgress"
                :disabled="redemptionInProgress || !isFormValid || userPoints < product.points"
                @click="$emit('redeem')"
              >
                Confirm Redemption
              </UButton>
            </div>
        </div>
      </div>
    </template>
  </UModal>
</template>