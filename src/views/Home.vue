<script setup lang="ts">
import StatsCards from "../components/StatsCards.vue";
import LeaderboardTable from "../components/LeaderboardTable.vue";
</script>

<template>
  <div>
    <div class="font-bold text-3xl text-center text-primary-500 mb-10 ml-6 mt-10">
      <h1>Welcome to AWS User Group Madurai</h1>
    </div>

    <div class="container mx-auto px-4 py-6">
      <StatsCards />
    </div>

    <div class="container mx-auto px-4 py-6">
      <LeaderboardTable />
    </div>
  </div>
</template>
