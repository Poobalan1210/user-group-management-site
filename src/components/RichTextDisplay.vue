<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  content: string;
}>();

const formattedContent = computed(() => {
  let formatted = props.content;
  
  // Convert markdown-style formatting to HTML
  formatted = formatted
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-500 hover:text-blue-600 underline">$1</a>')
    // Bullet points
    .replace(/^• (.+)$/gm, '<li class="ml-4">$1</li>')
    // Line breaks
    .replace(/\n/g, '<br>');
  
  // Wrap bullet points in ul tags
  if (formatted.includes('<li')) {
    formatted = formatted.replace(/(<li.*?<\/li>)/g, '<ul class="list-disc ml-4">$1</ul>');
  }
  
  return formatted;
});
</script>

<template>
  <div class="rich-text-display" v-html="formattedContent"></div>
</template>

<style scoped>
.rich-text-display :deep(ul) {
  margin: 0.5rem 0;
}

.rich-text-display :deep(li) {
  margin: 0.25rem 0;
}

.rich-text-display :deep(strong) {
  font-weight: 600;
}

.rich-text-display :deep(em) {
  font-style: italic;
}

.rich-text-display :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}

.rich-text-display :deep(a:hover) {
  color: #2563eb;
}
</style>