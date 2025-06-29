<script setup lang="ts">
import { ref, watch } from 'vue';
import { secureImageUploadService } from '../services/secureImageUpload';

const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
  folder?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

// Local reactive reference to ensure proper updates
const currentImageUrl = ref(props.modelValue || '');

// Watch for changes in modelValue prop
watch(
  () => props.modelValue,
  (newValue) => {
    console.log('ImageUpload - modelValue changed:', newValue);
    currentImageUrl.value = newValue || '';
  },
  { immediate: true }
);

// Debug: Log initial props
console.log('ImageUpload - Initial props:', props);

const isUploading = ref(false);
const fileInput = ref<HTMLInputElement>();

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB');
    return;
  }
  
  isUploading.value = true;
  
  try {
    const imageUrl = await secureImageUploadService.uploadImage(file, props.folder || 'checkpoints');
    currentImageUrl.value = imageUrl;
    emit('update:modelValue', imageUrl);
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Failed to upload image. Please try again.');
  } finally {
    isUploading.value = false;
  }
};

const triggerFileSelect = () => {
  fileInput.value?.click();
};

const removeImage = () => {
  currentImageUrl.value = '';
  emit('update:modelValue', '');
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};
</script>

<template>
  <div class="image-upload">
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileSelect"
      class="hidden"
    />
    
    <!-- Debug info -->
    <div class="text-xs text-gray-500 mb-2">
      Debug: modelValue = "{{ modelValue || 'empty' }}", currentImageUrl = "{{ currentImageUrl || 'empty' }}"
    </div>
    
    <div v-if="currentImageUrl" class="mb-4">
      <div class="relative inline-block">
        <img 
          :src="currentImageUrl" 
          alt="Uploaded image" 
          class="max-w-xs max-h-48 rounded-lg shadow-sm"
          @error="console.error('Failed to load image:', currentImageUrl)"
        />
        <UButton
          size="xs"
          color="red"
          variant="solid"
          icon="i-heroicons-x-mark"
          class="absolute -top-2 -right-2"
          @click="removeImage"
        />
      </div>
    </div>
    
    <div v-else class="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
      <UIcon name="i-heroicons-photo" class="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p class="text-sm text-gray-400 mb-4">{{ placeholder || 'Upload image' }}</p>
      <UButton
        @click="triggerFileSelect"
        :loading="isUploading"
        :disabled="isUploading"
        color="primary"
        variant="outline"
      >
        {{ isUploading ? 'Uploading...' : 'Choose Image' }}
      </UButton>
    </div>
    
    <p class="text-xs text-gray-500 mt-2">
      Supported formats: JPG, PNG, GIF. Max size: 5MB
    </p>
  </div>
</template>

<style scoped>
.image-upload {
  width: 100%;
}
</style>