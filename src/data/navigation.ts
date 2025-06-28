import { useAdmin } from '../composables/useAdmin';

export function getNavigationItems() {
  const { isAdmin } = useAdmin();
  
  const items = [
    {
      label: 'Home',
      to: '/',
      icon: 'i-heroicons-home',
      class: "text-lg mr-4"
    },
    {
      label: 'Events',
      to: '/events',
      icon: 'i-heroicons-calendar',
      class: "text-lg mr-4"
    }
  ];
  
  // Only add Admin tab for admin users
  if (isAdmin.value) {
    items.push({
      label: 'Admin',
      to: '/admin',
      icon: 'i-heroicons-shield-check',
      class: "text-lg mr-4"
    });
  }
  
  return items;
}