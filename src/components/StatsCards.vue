<script setup lang="ts">
import { onMounted } from 'vue';
import { useStatsStore } from '../stores/statsStore';

const statsStore = useStatsStore();

onMounted(() => {
  statsStore.fetchStats();
});
</script>

<template>
  <div v-if="statsStore.isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <UCard
      v-for="index in 4"
      :key="index"
      class="flex flex-col border-2 border-gray-300 dark:border-gray-700"
    >
      <div class="flex items-center justify-between animate-pulse">
        <div class="flex-1">
          <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        </div>
        <div class="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    </UCard>
  </div>
  
  <div v-else-if="statsStore.error" class="mb-8 text-center py-8">
    <UIcon name="i-lucide-alert-circle" class="text-4xl text-red-400 mx-auto mb-4" />
    <p class="text-red-600">{{ statsStore.error }}</p>
  </div>
  
  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <UCard
      v-for="(stat, index) in statsStore.stats"
      :key="index"
      class="flex flex-col border-2 border-gray-300 dark:border-gray-700"
    >
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xl text-gray-500 dark:text-gray-400">
            {{ stat.title }}
          </div>
          <div class="text-2xl font-bold mt-1">
            {{ stat.value.toLocaleString() }}
          </div>
          <div class="text-xs text-gray-500 mt-1">{{ stat.trend }}</div>
        </div>
        <UIcon
          :name="stat.icon"
          class="text-3xl"
          :class="`text-${stat.color}-500`"
        />
      </div>
    </UCard>
  </div>
</template>
