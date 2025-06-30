import { ref, computed } from 'vue';
import { useAuthStore } from '../auth/authStore';

// Get admin emails from environment variable
const adminEmailsString = import.meta.env.ADMIN_EMAILS;
const ADMIN_EMAILS = adminEmailsString.split(',');

export function useAdmin() {
  const authStore = useAuthStore();
  
  // Check if the current user is an admin
  const isAdmin = computed(() => {
    if (!authStore.isAuthenticated || !authStore.user) return false;
    
    const userEmail = authStore.user.attributes?.email || '';
    return ADMIN_EMAILS.includes(userEmail);
  });

  return {
    isAdmin
  };
}