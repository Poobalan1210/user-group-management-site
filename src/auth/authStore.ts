import { defineStore } from 'pinia';
import { ref } from 'vue';
import { AuthService } from './auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(true);

  // Initialize the auth state
  async function init() {
    isLoading.value = true;
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        user.value = currentUser;
        isAuthenticated.value = true;
      }
    } catch (error) {
      console.error('Error initializing auth store:', error);
    } finally {
      isLoading.value = false;
    }
  }

  // Sign in (updated to work with custom forms)
  async function signIn(email?: string, password?: string) {
    isLoading.value = true;
    try {
      if (email && password) {
        await AuthService.signIn(email, password);
        // Refresh user state after successful sign in
        await init();
      } else {
        // Redirect to auth page if no credentials provided
        window.location.href = '/auth';
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  // Sign out
  async function signOut() {
    isLoading.value = true;
    try {
      await AuthService.signOut();
      user.value = null;
      isAuthenticated.value = false;
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      isLoading.value = false;
    }
  }

  // Check authentication on page load or route change
  async function checkAuth() {
    if (!isLoading.value && !isAuthenticated.value) {
      isLoading.value = true;
      try {
        const authenticated = await AuthService.isAuthenticated();
        isAuthenticated.value = authenticated;
        if (authenticated) {
          user.value = await AuthService.getCurrentUser();
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        isLoading.value = false;
      }
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    init,
    signIn,
    signOut,
    checkAuth
  };
});