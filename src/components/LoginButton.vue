<script setup lang="ts">
import { useAuthStore } from '../auth/authStore';
import { onMounted, computed } from 'vue';

const authStore = useAuthStore();

// Initialize auth state on component mount
onMounted(async () => {
  await authStore.init();

  // Check for authentication code in URL (after redirect from Cognito)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('code')) {
    await authStore.checkAuth();
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

// Computed property for button text
const buttonText = computed(() => {
  if (authStore.isLoading) return 'Loading...';
  return authStore.isAuthenticated ? 'Sign Out' : 'Sign In';
});

// Handle button click
const handleClick = async () => {
  if (authStore.isAuthenticated) {
    console.log('Signing out...');
    await authStore.signOut();
  } else {
    // Redirect to custom auth page instead of using hosted UI
    window.location.href = '/auth';
  }
};

// Get user's name for display
const userName = computed(() => {
  if (!authStore.user) return '';
  // Try to get name from attributes first, then fallback to username
  return authStore.user.attributes?.name || 
         authStore.user.attributes?.given_name || 
         authStore.user.username || 
         authStore.user.signInDetails?.loginId || 
         '';
});


const items = computed(() => [
  { label: 'Profile', icon: 'i-heroicons-user-circle', onSelect: () => window.location.href = '/profile' },
  { label: 'Sign Out', icon: 'i-heroicons-arrow-right-on-rectangle', onSelect: handleClick }
]);

</script>

<template>
  <div>
    <div v-if="authStore.isAuthenticated" class="flex items-center mr-4">
      <UDropdownMenu :items="items">
        <UButton color="primary" variant="ghost">
          <template #leading>
            <UAvatar 
              size="sm" 
              :alt="userName" 
            />
          </template>
          {{ userName }}
        </UButton>
      </UDropdownMenu>
    </div>
    <UButton v-else color="primary" :loading="authStore.isLoading" @click="handleClick">
      <template #leading>
        <UIcon name="i-heroicons-user" />
      </template>
      {{ buttonText }}
    </UButton>
  </div>
</template>