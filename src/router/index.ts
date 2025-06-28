import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Events from '../views/Events.vue'
import Admin from '../views/Admin.vue'
import Profile from '../views/Profile.vue'
import Auth from '../views/Auth.vue'
import { useAdmin } from '../composables/useAdmin'
import { useAuthStore } from '../auth/authStore'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: 'Home' }
  },
  {
    path: '/events',
    name: 'Events',
    component: Events,
    meta: { title: 'Events' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { title: 'Admin', requiresAdmin: true }
  },
  {
    path: '/profile/:id',
    name: 'Profile',
    component: Profile,
    meta: { title: 'User Profile' }
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth,
    meta: { title: 'Authentication', requiresGuest: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Make sure auth is initialized
  if (!authStore.isAuthenticated) {
    await authStore.init();
  }
  
  // Check if the route requires admin privileges
  if (to.meta.requiresAdmin) {
    const { isAdmin } = useAdmin();
    
    if (isAdmin.value) {
      next(); // Allow access
    } else {
      next('/'); // Redirect to home
    }
  }
  // Check if the route requires guest (not authenticated)
  else if (to.meta.requiresGuest) {
    if (authStore.isAuthenticated) {
      next('/'); // Redirect authenticated users to home
    } else {
      next(); // Allow access for guests
    }
  }
  else {
    next(); // No special requirements, proceed
  }
})

export default router
