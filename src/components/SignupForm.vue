<script setup lang="ts">
import { ref, reactive } from 'vue';
import { signUp, confirmSignUp } from 'aws-amplify/auth';
import { UserService } from '../services/userService';

const emit = defineEmits<{
  (e: 'switch-to-login'): void;
  (e: 'signup-success'): void;
}>();

const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const showConfirmation = ref(false);

const signupForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  linkedinUrl: '',
  githubUrl: ''
});

const confirmationForm = reactive({
  code: ''
});

const validateForm = () => {
  if (!signupForm.email || !signupForm.password || !signupForm.name) {
    errorMessage.value = 'Please fill in all required fields';
    return false;
  }

  if (signupForm.password !== signupForm.confirmPassword) {
    errorMessage.value = 'Passwords do not match';
    return false;
  }

  if (signupForm.password.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long';
    return false;
  }

  // Validate LinkedIn URL format if provided
  if (signupForm.linkedinUrl && !signupForm.linkedinUrl.includes('linkedin.com')) {
    errorMessage.value = 'Please enter a valid LinkedIn URL';
    return false;
  }

  // Validate GitHub URL format if provided
  if (signupForm.githubUrl && !signupForm.githubUrl.includes('github.com')) {
    errorMessage.value = 'Please enter a valid GitHub URL';
    return false;
  }

  return true;
};

const handleSignup = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // First, create the Cognito user
    await signUp({
      username: signupForm.email,
      password: signupForm.password,
      options: {
        userAttributes: {
          email: signupForm.email,
          name: signupForm.name,
          'custom:linkedinurl': signupForm.linkedinUrl || '',
          'custom:githuburl': signupForm.githubUrl || ''
        }
      }
    });

    // Show confirmation step immediately after Cognito signup
    showConfirmation.value = true;
    successMessage.value = 'Account created! Please check your email for the confirmation code.';
    
    // Try to store user data in our users table, but don't fail the signup if this fails
    try {
      await UserService.createUser({
        email: signupForm.email,
        name: signupForm.name,
        linkedinUrl: signupForm.linkedinUrl || '',
        githubUrl: signupForm.githubUrl || '',
        createdAt: new Date().toISOString()
      });
    } catch (dbError) {
      console.warn('Failed to create user in database, but Cognito user created successfully:', dbError);
      // We'll create the user record later when they confirm their email
    }
  } catch (error: any) {
    console.error('Signup error:', error);
    errorMessage.value = error.message || 'Signup failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const handleConfirmSignup = async () => {
  if (!confirmationForm.code) {
    errorMessage.value = 'Please enter the confirmation code';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await confirmSignUp({
      username: signupForm.email,
      confirmationCode: confirmationForm.code
    });

    // Try to create user in database after successful email confirmation
    try {
      await UserService.createUser({
        email: signupForm.email,
        name: signupForm.name,
        linkedinUrl: signupForm.linkedinUrl || '',
        githubUrl: signupForm.githubUrl || '',
        createdAt: new Date().toISOString()
      });
    } catch (dbError) {
      console.warn('Failed to create user in database after confirmation:', dbError);
      // Continue anyway - user can still sign in
    }

    successMessage.value = 'Email confirmed successfully! You can now sign in.';
    setTimeout(() => {
      emit('signup-success');
    }, 2000);
  } catch (error: any) {
    console.error('Confirmation error:', error);
    errorMessage.value = error.message || 'Confirmation failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const resendConfirmationCode = async () => {
  // Implementation for resending confirmation code would go here
  // This requires additional Amplify setup
};
</script>

<template>
  <UCard class="w-full max-w-2xl mx-auto">
    <template #header>
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ showConfirmation ? 'Confirm Your Email' : 'Create Account' }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          {{ showConfirmation ? 'Enter the code sent to your email' : 'Join AWS UG Madurai community' }}
        </p>
      </div>
    </template>

    <UForm v-if="!showConfirmation"  :state="signupForm" class="space-y-4" @submit="handleSignup">
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
        color="neutral"
        variant="soft"
        :title="successMessage"
        :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
        @close="successMessage = ''"
      />

      <UFormField label="Full Name" required>
        <UInput
          v-model="signupForm.name"
          placeholder="Enter your full name"
          size="lg"
          :disabled="isLoading"
        />
      </UFormField>

      <UFormField label="Email" required>
        <UInput
          v-model="signupForm.email"
          type="email"
          placeholder="Enter your email"
          size="lg"
          :disabled="isLoading"
        />
      </UFormField>

      <UFormField label="LinkedIn Profile URL" help="Optional - helps us connect with you">
        <UInput
          v-model="signupForm.linkedinUrl"
          placeholder="https://linkedin.com/in/yourprofile"
          size="lg"
          :disabled="isLoading"
        />
      </UFormField>

      <UFormField label="GitHub Profile URL" help="Optional - showcase your projects">
        <UInput
          v-model="signupForm.githubUrl"
          placeholder="https://github.com/yourusername"
          size="lg"
          :disabled="isLoading"
        />
      </UFormField>

      <UFormField label="Password" required>
        <UInput
          v-model="signupForm.password"
          type="password"
          placeholder="Create a password (min 8 characters)"
          size="lg"
          :disabled="isLoading"
        />
      </UFormField>

      <UFormField label="Confirm Password" required>
        <UInput
          v-model="signupForm.confirmPassword"
          type="password"
          placeholder="Confirm your password"
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
        :disabled="!signupForm.email || !signupForm.password || !signupForm.name"
      >
        Create Account
      </UButton>

    </UForm>

    <UForm :state="confirmationForm" v-else @submit="handleConfirmSignup" class="space-y-6">

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

      <UFormField label="Confirmation Code" required>
        <UInput
          v-model="confirmationForm.code"
          placeholder="Enter 6-digit code"
          icon="i-heroicons-key"
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
        :disabled="!confirmationForm.code"
      >
        Confirm Email
      </UButton>

      <UButton
        variant="ghost"
        color="primary"
        size="sm"
        block
        @click="resendConfirmationCode"
        :disabled="isLoading"
      >
        Resend Code
      </UButton>

    </UForm>


    <template #footer>
      <div class="text-center">
        <p class="text-gray-600 dark:text-gray-400">
          Already have an account?
          <UButton
            variant="ghost"
            color="primary"
            size="sm"
            @click="emit('switch-to-login')"
            :disabled="isLoading"
          >
            Sign in
          </UButton>
        </p>
      </div>
    </template>
  </UCard>
</template>