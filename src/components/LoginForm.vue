<script setup lang="ts">
import { ref, reactive } from 'vue';
import { signIn } from 'aws-amplify/auth';
import { useAuthStore } from '../auth/authStore';
import { useRouter } from 'vue-router';

const emit = defineEmits<{
  (e: 'switch-to-signup'): void;
  (e: 'forgot-password', email: string): void;
}>();

const authStore = useAuthStore();
const router = useRouter();

const isLoading = ref(false);
const errorMessage = ref('');

const loginForm = reactive({
  email: '',
  password: ''
});

const handleLogin = async () => {
  if (!loginForm.email || !loginForm.password) {
    errorMessage.value = 'Please fill in all fields';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await signIn({
      username: loginForm.email,
      password: loginForm.password
    });

    // Refresh auth state
    await authStore.init();

    // Redirect to home page
    router.push('/');
  } catch (error: any) {
    console.error('Login error:', error);
    errorMessage.value = error.message || 'Login failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const handleForgotPassword = () => {
  if (!loginForm.email) {
    errorMessage.value = 'Please enter your email address first';
    return;
  }
  emit('forgot-password', loginForm.email);
};
</script>

<template>
  <UCard class="w-full max-w-md mx-auto">
    <template #header>
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Sign In</h2>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Welcome back to AWS UG Madurai</p>
      </div>
    </template>

    <UForm :state="loginForm" class="space-y-4" @submit="handleLogin">
      <UAlert v-if="errorMessage" color="error" variant="soft" :title="errorMessage"
        :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
        @close="errorMessage = ''" />

      <UFormField label="Email" name="email">
        <UInput v-model="loginForm.email" type="email" :disabled="isLoading" />
      </UFormField>

      <UFormField label="Password" name="password">
        <UInput v-model="loginForm.password" type="password" :disabled="isLoading" />
      </UFormField>

      <UFormField>
        <UButton variant="ghost" color="primary" size="sm" @click="handleForgotPassword" :disabled="isLoading">
          Forgot password?
        </UButton>
      </UFormField>

      <UButton type="submit" color="primary" size="lg" block :loading="isLoading"
        :disabled="!loginForm.email || !loginForm.password">
        Sign In
      </UButton>
    </UForm>

    <template #footer>
      <div class="text-center">
        <p class="text-gray-600 dark:text-gray-400">
          Don't have an account?
          <UButton variant="ghost" color="primary" size="sm" @click="emit('switch-to-signup')" :disabled="isLoading">
            Sign up
          </UButton>
        </p>
      </div>
    </template>
  </UCard>
</template>