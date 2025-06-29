<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const textareaRef = ref<HTMLTextAreaElement>();
const content = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  content.value = newValue;
});

watch(content, (newValue) => {
  emit('update:modelValue', newValue);
});

const insertFormatting = (format: string) => {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = content.value.substring(start, end);
  
  let replacement = '';
  switch (format) {
    case 'bold':
      replacement = `**${selectedText || 'bold text'}**`;
      break;
    case 'italic':
      replacement = `*${selectedText || 'italic text'}*`;
      break;
    case 'emoji':
      replacement = `${selectedText}🚀`;
      break;
    case 'bullet':
      replacement = `\n• ${selectedText || 'bullet point'}`;
      break;
    case 'link':
      replacement = `[${selectedText || 'link text'}](https://example.com)`;
      break;
  }

  content.value = content.value.substring(0, start) + replacement + content.value.substring(end);
  
  // Focus back to textarea
  textarea.focus();
  const newCursorPos = start + replacement.length;
  textarea.setSelectionRange(newCursorPos, newCursorPos);
};
</script>

<template>
  <div class="rich-text-editor">
    <div class="toolbar mb-2 flex gap-2 flex-wrap">
      <UButton size="xs" variant="outline" @click="insertFormatting('bold')" title="Bold">
        <strong>B</strong>
      </UButton>
      <UButton size="xs" variant="outline" @click="insertFormatting('italic')" title="Italic">
        <em>I</em>
      </UButton>
      <UButton size="xs" variant="outline" @click="insertFormatting('emoji')" title="Add Emoji">
        🚀
      </UButton>
      <UButton size="xs" variant="outline" @click="insertFormatting('bullet')" title="Bullet Point">
        •
      </UButton>
      <UButton size="xs" variant="outline" @click="insertFormatting('link')" title="Link">
        🔗
      </UButton>
    </div>
    <UTextarea
      ref="textareaRef"
      v-model="content"
      :placeholder="placeholder"
      :rows="6"
      class="w-full dark-input"
    />
    <div class="text-xs text-gray-400 mt-1">
      Use **bold**, *italic*, • bullets, [links](url), and emojis 🚀
    </div>
  </div>
</template>

<style scoped>
.rich-text-editor .toolbar {
  border-bottom: 1px solid #334155;
  padding-bottom: 0.5rem;
}
</style>