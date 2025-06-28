<script setup lang="ts">
import { ref } from 'vue';
import LoginForm from '../components/LoginForm.vue';
import SignupForm from '../components/SignupForm.vue';
import ForgotPasswordForm from '../components/ForgotPasswordForm.vue';

type AuthMode = 'login' | 'signup' | 'forgot-password';

const currentMode = ref<AuthMode>('login');
const forgotPasswordEmail = ref('');

const switchToSignup = () => {
  currentMode.value = 'signup';
};

const switchToLogin = () => {
  currentMode.value = 'login';
};

const handleForgotPassword = (email: string) => {
  forgotPasswordEmail.value = email;
  currentMode.value = 'forgot-password';
};

const handleSignupSuccess = () => {
  currentMode.value = 'login';
};
</script>

<template>
  <div class="max-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="px-4 py-8 sm:px-10">
        <LoginForm
          v-if="currentMode === 'login'"
          @switch-to-signup="switchToSignup"
          @forgot-password="handleForgotPassword"
        />
        
        <SignupForm
          v-else-if="currentMode === 'signup'"
          @switch-to-login="switchToLogin"
          @signup-success="handleSignupSuccess"
        />
        
        <ForgotPasswordForm
          v-else-if="currentMode === 'forgot-password'"
          :initial-email="forgotPasswordEmail"
          @back-to-login="switchToLogin"
        />
      </div>
    </div>

    <div class="mt-8 text-center">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        By signing up, you agree to our terms of service and privacy policy.
      </p>
    </div>
  </div>
</template>