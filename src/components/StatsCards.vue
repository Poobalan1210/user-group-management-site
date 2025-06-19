<script setup lang="ts">
import { useStatsData } from '../composables/useStatsData';

const { stats } = useStatsData();
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <UCard
      v-for="(stat, index) in stats"
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
