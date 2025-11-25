<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { FormKit, FormKitSchema } from '@formkit/vue';
import { getFormSchemaById } from '../data/formSchemas';
import { fileUploadService } from '../services/fileUploadService';

const formRef = ref(null);

const props = defineProps<{
  isOpen: boolean;
  eventTitle?: string;
  formSchemaId?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', data: any): void;
}>();

const formData = ref({});
const isUploading = ref(false);
const uploadError = ref('');

const selectedSchema = computed(() => {
  return props.formSchemaId ? getFormSchemaById(props.formSchemaId) : null;
});

// Watch for schema changes to reset form data
watch(() => props.formSchemaId, () => {
  formData.value = {};
});

// Watch specifically for projectFile changes
watch(() => formRef.value?.node?.value?.projectFile, async (newProjectFile, oldProjectFile) => {
  if (newProjectFile && newProjectFile.length > 0) {
    const fileObject = newProjectFile[0];
    const file = fileObject.file || fileObject;
    
    if (file instanceof File) {
      // Check if this is a new file (different from previous or no previous file)
      const isNewFile = !oldProjectFile || 
                       oldProjectFile.length === 0 || 
                       oldProjectFile[0]?.file?.name !== file.name ||
                       oldProjectFile[0]?.file?.size !== file.size;
      
      if (isNewFile && !formRef.value?.node?.value?.projectFileUrl) {
        await handleFileUpload(file);
      }
    }
  }
}, { immediate: false });

const handleFileUpload = async (file: File) => {
  console.log('Handling file upload:', file.name, file.size, file.type);

  try {
    isUploading.value = true;
    uploadError.value = '';

    const folder = `submissions/${props.eventTitle?.replace(/\s+/g, '-').toLowerCase() || 'general'}`;
    console.log('Uploading to folder:', folder);
    
    const fileUrl = await fileUploadService.uploadFile(file, folder);
    console.log('File uploaded successfully, URL:', fileUrl);

    // Update the FormKit node directly
    if (formRef.value?.node) {
      const formNode = formRef.value.node;
      const currentValue = { ...formNode.value };
      currentValue.projectFileUrl = fileUrl;
      
      console.log('Updating FormKit node with URL:', fileUrl);
      formNode.input(currentValue);
    }
    
    // Also update formData as backup
    formData.value.projectFileUrl = fileUrl;
    console.log('Updated formData.projectFileUrl to:', fileUrl);

  } catch (error) {
    console.error('File upload error:', error);
    uploadError.value = error.message || 'Failed to upload file';
  } finally {
    isUploading.value = false;
  }
};

const handleFormSubmit = async (data: any) => {
  console.log('Form data before submission:', data);
  try {
    isUploading.value = true;
    uploadError.value = '';
    
    delete data.projectFile;
    
    const submissionData = {
      ...data,
      schemaId: props.formSchemaId,
      schemaName: selectedSchema.value?.name,
      eventTitle: props.eventTitle,
      submittedAt: new Date().toISOString()
    };
    
    console.log('Form submitted:', submissionData);
    emit('submit', submissionData);
    handleClose();
  } catch (error) {
    console.error('Error during form submission:', error);
    uploadError.value = error.message || 'Failed to upload file';
  } finally {
    isUploading.value = false;
  }
};

const handleClose = () => {
  formData.value = {};
  uploadError.value = '';
  emit('close');
};

const formHandlers = {
  handleFileUpload
};
</script>

<template>
  <UModal :open="isOpen" :close="true" size="2xl" @update:open="handleClose" @close:prevent="handleClose">
    <template #title>
      <div class="flex items-center gap-3">
        <div class="p-2 bg-primary-100 dark:bg-primary-950 rounded-lg">
          <UIcon name="i-heroicons-document-check" class="text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 class="text-lg font-bold">Submit Challenge</h3>
          <p v-if="eventTitle" class="text-sm text-gray-600 dark:text-gray-400">{{ eventTitle }}</p>
        </div>
      </div>
    </template>

    <template #body>
      <div class="bg-white dark:bg-gray-950">
        <!-- Show form if schema is available -->
        <div v-if="selectedSchema" class="p-6 space-y-6">
          <div class="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div class="flex gap-3">
              <UIcon name="i-heroicons-information-circle" class="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 class="font-semibold text-blue-900 dark:text-blue-300">{{ selectedSchema.name }}</h4>
                <p class="text-sm text-blue-800 dark:text-blue-400 mt-1">{{ selectedSchema.description }}</p>
              </div>
            </div>
          </div>

          <!-- Error Alert -->
          <div v-if="uploadError" class="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div class="flex gap-3">
              <UIcon name="i-heroicons-exclamation-circle" class="text-red-600 dark:text-red-400 flex-shrink-0" />
              <p class="text-sm text-red-800 dark:text-red-300">{{ uploadError }}</p>
            </div>
          </div>

          <!-- FormKit Dynamic Form -->
          <div class="formkit-form max-h-96 overflow-y-auto pr-2">
            <FormKit type="form" ref="formRef" v-model="formData" @submit="handleFormSubmit">
              <FormKitSchema :schema="selectedSchema.schema || []" :data="{ $handlers: formHandlers }" />
            </FormKit>
          </div>
        </div>

        <!-- Show message if no schema is configured -->
        <div v-else class="text-center py-12 px-6">
          <div class="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-document-text" class="text-3xl text-gray-400" />
          </div>
          <h4 class="text-lg font-semibold mb-2">No Form Configured</h4>
          <p class="text-gray-600 dark:text-gray-400">
            The event organizer hasn't configured a submission form for this event yet.
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <UButton variant="outline" color="gray" @click="handleClose">
          Cancel
        </UButton>
        <UButton
          v-if="selectedSchema"
          :loading="isUploading"
          :disabled="isUploading"
          type="button"
          @click="() => formRef?.node?.submit()"
        >
          <UIcon name="i-heroicons-check" class="mr-2" />
          {{ isUploading ? 'Submitting...' : 'Submit Challenge' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
/* Custom FormKit styling */
:deep(.formkit-form) {
  --fk-color-primary: rgb(59 130 246);
  --fk-color-primary-contrast: white;
  --fk-color-file-border: rgb(209 213 219);
  --fk-color-file-border-dark: rgb(75 85 99);
}

:deep(.formkit-outer) {
  margin-bottom: 1rem;
}

:deep(.formkit-label) {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: rgb(55 65 81);
}

:deep(.dark .formkit-label) {
  color: rgb(209 213 219);
}

:deep(.formkit-input) {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgb(209 213 219);
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  transition: all 0.15s ease-in-out;
}

:deep(.formkit-input:focus) {
  outline: none;
  ring: 2px;
  ring-color: rgb(59 130 246);
  border-color: rgb(59 130 246);
}

:deep(.dark .formkit-input) {
  background-color: rgb(31 41 55);
  border-color: rgb(75 85 99);
  color: white;
}

:deep(.formkit-help) {
  font-size: 0.75rem;
  color: rgb(107 114 128);
  margin-top: 0.25rem;
}

:deep(.formkit-message) {
  font-size: 0.875rem;
  color: rgb(220 38 38);
  margin-top: 0.25rem;
}

:deep(.formkit-actions) {
  margin-top: 1.5rem;
}

:deep(.formkit-input[type="submit"]) {
  background-color: rgb(59 130 246);
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

:deep(.formkit-input[type="submit"]:hover) {
  background-color: rgb(37 99 235);
}

:deep(.formkit-input[type="checkbox"]) {
  width: auto;
  margin-right: 0.5rem;
}

:deep(.formkit-input[type="file"]) {
  padding: 0.5rem;
  border: 1px dashed rgb(209 213 219);
  background-color: transparent;
}

:deep(.dark .formkit-input[type="file"]) {
  border-color: rgb(75 85 99);
}

:deep(.formkit-fieldset) {
  border: none;
  padding: 0;
  margin: 0;
}

:deep(.formkit-legend) {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: rgb(55 65 81);
}

:deep(.dark .formkit-legend) {
  color: rgb(209 213 219);
}
</style>