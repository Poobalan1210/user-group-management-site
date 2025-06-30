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

// Watch for changes in the FormKit node value
watch(() => formRef.value?.node?.value, async (newValue, oldValue) => {
  if (newValue?.projectFile && newValue.projectFile.length > 0) {
    const fileObject = newValue.projectFile[0];
    console.log('File object from FormKit:', fileObject);
    
    // The actual File object is nested inside
    const file = fileObject.file || fileObject;
    
    if (file instanceof File) {
      console.log('Valid File detected:', file.name, file.size, file.type);
      
      // Check if we already uploaded this file
      if (!newValue.projectFileUrl || newValue.projectFileUrl === '') {
        console.log('No URL found, uploading file...');
        await handleFileUpload(file);
      } else {
        console.log('File already uploaded, URL:', newValue.projectFileUrl);
      }
    } else {
      console.log('Not a valid File object:', file);
    }
  }
}, { deep: true, immediate: false });

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
  <UModal :open="isOpen" :close="true"  @update:open="handleClose" @close:prevent="handleClose">
    <template #title>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">
          Submit Challenge{{ eventTitle ? ` - ${eventTitle}` : '' }}
        </h3>
      </div>
    </template>

    <template #body>
      <div class="p-6">
        <!-- Show form if schema is available -->
        <div v-if="selectedSchema" class="space-y-4">

          <!-- FormKit Dynamic Form -->
          <div class="formkit-form">
            <div v-if="uploadError" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {{ uploadError }}
            </div>
            
            <FormKit type="form" ref="formRef" v-model="formData" @submit="handleFormSubmit" >
              <FormKitSchema :schema="selectedSchema.schema || []" :data="{ $handlers: formHandlers }"/>
              <template #submit="{ attrs }">
                <button v-bind="attrs" :disabled="isUploading">
                  <UButton v-if="isUploading" :loading="isUploading">Uploading</UButton>
                  <UButton v-else>Submit</UButton>
                </button>
              </template>
            </FormKit>
          </div>
        </div>

        <!-- Show message if no schema is configured -->
        <div v-else class="text-center py-8">
          <UIcon name="i-heroicons-document-text" class="text-4xl text-gray-400 mx-auto mb-4" />
          <h4 class="text-lg font-medium mb-2">No Form Configured</h4>
          <p class="text-gray-600 dark:text-gray-400">
            The event organizer hasn't configured a submission form for this event yet.
          </p>
        </div>
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