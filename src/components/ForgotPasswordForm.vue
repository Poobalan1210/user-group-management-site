<script setup lang="ts">
import { ref, reactive } from 'vue';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';

const emit = defineEmits<{
  (e: 'back-to-login'): void;
}>();

const props = defineProps<{
  initialEmail?: string;
}>();

const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const showConfirmation = ref(false);

const forgotPasswordForm = reactive({
  email: props.initialEmail || ''
});

const confirmationForm = reactive({
  code: '',
  newPassword: '',
  confirmPassword: ''
});

const handleForgotPassword = async () => {
  if (!forgotPasswordForm.email) {
    errorMessage.value = 'Please enter your email address';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await resetPassword({
      username: forgotPasswordForm.email
    });

    showConfirmation.value = true;
    successMessage.value = 'Password reset code sent to your email!';
  } catch (error: any) {
    console.error('Forgot password error:', error);
    errorMessage.value = error.message || 'Failed to send reset code. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const handleConfirmReset = async () => {
  if (!confirmationForm.code || !confirmationForm.newPassword) {
    errorMessage.value = 'Please fill in all fields';
    return;
  }

  if (confirmationForm.newPassword !== confirmationForm.confirmPassword) {
    errorMessage.value = 'Passwords do not match';
    return;
  }

  if (confirmationForm.newPassword.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await confirmResetPassword({
      username: forgotPasswordForm.email,
      confirmationCode: confirmationForm.code,
      newPassword: confirmationForm.newPassword
    });

    successMessage.value = 'Password reset successfully! You can now sign in with your new password.';
    setTimeout(() => {
      emit('back-to-login');
    }, 2000);
  } catch (error: any) {
    console.error('Confirm reset error:', error);
    errorMessage.value = error.message || 'Failed to reset password. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <UCard class="w-full max-w-md mx-auto">
    <template #header>
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ showConfirmation ? 'Reset Password' : 'Forgot Password' }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          {{ showConfirmation ? 'Enter the code and your new password' : 'Enter your email to receive a reset code' }}
        </p>
      </div>
    </template>



    <!-- Forgot Password Form -->
    <UForm :state="forgotPasswordForm" v-if="!showConfirmation" @submit="handleForgotPassword" class="space-y-6">
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        :title="errorMessage"
        :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
        @close="errorMessage = ''"
      />

      <UAlert
        v-if="successMessage"
        color="primary"
        variant="soft"
        :title="successMessage"
        :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
        @close="successMessage = ''"
      />

      <UFormField label="Email" required>
        <UInput
          v-model="forgotPasswordForm.email"
          type="email"
          placeholder="Enter your email"
          icon="i-heroicons-envelope"
          size="lg"
          :disabled="isLoading"
        />
      </UFormField>

      <UButton
        type="submit"
        color="primary"
        size="lg"
        block
        :loading="isLoading"
        :disabled="!forgotPasswordForm.email"
      >
        Send Reset Code
      </UButton>
    </UForm>

    <!-- Confirmation Form -->
    <UForm :state="confirmationForm" v-else @submit="handleConfirmReset" class="space-y-6">
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        :title="errorMessage"
        :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
        @close="errorMessage = ''"
      />

      <UAlert
        v-if="successMessage"
        color="primary"
        variant="soft"
        :title="successMessage"
        :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
        @close="successMessage = ''"
      />

      <UFormField label="Reset Code" required>
        <UInput
          v-model="confirmationForm.code"
          placeholder="Enter 6-digit code"
          icon="i-heroicons-key"
          size="lg"
          :disabled="isLoading"
        />
      </UFormField>

      <UFormField label="New Password" required>
        <UInput
          v-model="confirmationForm.newPassword"
          type="password"
          placeholder="Enter new password (min 8 characters)"
          icon="i-heroicons-lock-closed"
          size="lg"
          :disabled="isLoading"
        />
      </UFormField>

      <UFormField label="Confirm New Password" required>
        <UInput
          v-model="confirmationForm.confirmPassword"
          type="password"
          placeholder="Confirm new password"
          icon="i-heroicons-lock-closed"
          size="lg"
          :disabled="isLoading"
        />
      </UFormField>

      <UButton
        type="submit"
        color="primary"
        size="lg"
        block
        :loading="isLoading"
        :disabled="!confirmationForm.code || !confirmationForm.newPassword || !confirmationForm.confirmPassword"
      >
        Reset Password
      </UButton>
    </UForm>

    <template #footer>
      <div class="text-center">
        <UButton
          variant="ghost"
          color="primary"
          size="sm"
          @click="emit('back-to-login')"
          :disabled="isLoading"
        >
          ← Back to Sign In
        </UButton>
      </div>
    </template>
  </UCard>
</template>