import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Events from '../views/Events.vue'
import Admin from '../views/Admin.vue'
import Profile from '../views/Profile.vue'

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
    meta: { title: 'Admin' }
  },
  {
    path: '/profile/:id',
    name: 'Profile',
    component: Profile,
    meta: { title: 'User Profile' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
