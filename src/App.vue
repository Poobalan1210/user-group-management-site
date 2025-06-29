<script setup lang="ts">
import NavBar from "./components/NavBar.vue";
import { onMounted } from 'vue';

// Force dark mode on mount
onMounted(() => {
  document.documentElement.classList.add('dark');
});
</script>

<template>
  <UApp color-mode="dark">
    <NavBar />

    <router-view></router-view>
  </UApp>
</template>

<style>
/* Ensure dark mode is always applied */
:root {
  color-scheme: dark;
}
</style>
