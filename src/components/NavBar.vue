<script setup lang="ts">
import { ref } from 'vue';
import { navigationItems } from '../data/navigation';

const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};
</script>

<template>
  <div class="w-full p-4">
    <!-- Main navbar row -->
    <div class="flex items-center justify-between w-full">
      <!-- Logo -->
      <div class="flex items-center">
        <img
          src="../assets/chapter-badge-light.png"
          alt="Chapter Badge"
          class="h-16 md:h-20"
        />
      </div>

      <!-- Desktop Navigation - Hidden on mobile -->
      <div class="hidden md:block">
        <UNavigationMenu
          :items="navigationItems"
        />
      </div>

      <!-- Hamburger icon for mobile -->
      <button 
        class="md:hidden text-gray-700 focus:outline-none" 
        @click="toggleMobileMenu"
        aria-label="Toggle menu"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            v-if="!isMobileMenuOpen"
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M4 6h16M4 12h16M4 18h16" 
          />
          <path 
            v-else
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M6 18L18 6M6 6l12 12" 
          />
        </svg>
      </button>
    </div>

    <!-- Mobile menu dropdown -->
    <div 
      v-show="isMobileMenuOpen" 
      class="md:hidden mt-2 py-2"
    >
      <div class="flex flex-col space-y-1">
        <router-link 
          v-for="item in navigationItems" 
          :key="item.to" 
          :to="item.to"
          class="py-2 px-4 rounded hover:bg-gray-100 transition-colors"
          :class="{ 'text-primary-500 font-medium': $route.path === item.to }"
          @click="isMobileMenuOpen = false"
        >
          <span v-if="item.icon" class="inline-block mr-2" :class="item.icon"></span>
          {{ item.label }}
        </router-link>
      </div>
    </div>
  </div>
</template>