<script setup lang="ts">
import { computed } from 'vue';
import { getFormSchemaById } from '../data/formSchemas';

interface Props {
  formSchemaId?: string;
  showDescription?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showDescription: true
});

const schema = computed(() => {
  return props.formSchemaId ? getFormSchemaById(props.formSchemaId) : null;
});

const fieldCount = computed(() => {
  return schema.value?.schema?.length || 0;
});

const hasFileUpload = computed(() => {
  return schema.value?.schema?.some((field: any) => field.$formkit === 'file') || false;
});

const getFieldIcon = (fieldType: string) => {
  const icons: Record<string, string> = {
    'text': 'i-heroicons-document-text',
    'textarea': 'i-heroicons-bars-3',
    'email': 'i-heroicons-envelope',
    'url': 'i-heroicons-link',
    'number': 'i-heroicons-hashtag',
    'date': 'i-heroicons-calendar-days',
    'select': 'i-heroicons-list-bullet',
    'radio': 'i-heroicons-circle-stack',
    'checkbox': 'i-heroicons-check-circle',
    'file': 'i-heroicons-document-arrow-up',
    'hidden': 'i-heroicons-eye-slash'
  };
  return icons[fieldType] || 'i-heroicons-document';
};

const getFieldLabel = (field: any) => {
  return field.label || field.name || 'Unnamed Field';
};

const isRequired = (field: any) => {
  return field.validation?.includes('required') || false;
};
</script>

<template>
  <div v-if="schema" class="space-y-4">
    <!-- Schema Info -->
    <div v-if="showDescription" class="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-950/50 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
      <h3 class="font-semibold text-gray-900 dark:text-white">{{ schema.name }}</h3>
      <p class="text-sm text-gray-700 dark:text-gray-400 mt-1">{{ schema.description }}</p>
    </div>

    <!-- Form Stats -->
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center">
        <div class="text-2xl font-bold text-primary-600">{{ fieldCount }}</div>
        <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">Fields</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center">
        <div class="flex items-center justify-center">
          <UIcon
            :name="hasFileUpload ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
            :class="hasFileUpload ? 'text-green-600' : 'text-gray-400'"
          />
        </div>
        <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">File Upload</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center">
        <div class="text-sm font-semibold text-blue-600">Preview</div>
        <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">Mode</div>
      </div>
    </div>

    <!-- Form Fields Preview -->
    <div class="space-y-2">
      <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Form Fields</h4>
      <div class="space-y-2 max-h-96 overflow-y-auto">
        <div
          v-for="(field, index) in schema.schema"
          :key="index"
          class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
        >
          <div class="flex-shrink-0 mt-1">
            <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded">
              <UIcon :name="getFieldIcon(field.$formkit)" class="text-gray-600 dark:text-gray-300" />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start gap-2">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ getFieldLabel(field) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {{ field.$formkit }}
                </p>
              </div>
              <UBadge
                v-if="isRequired(field)"
                color="red"
                size="sm"
                variant="subtle"
              >
                Required
              </UBadge>
            </div>
            <p v-if="field.help" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {{ field.help }}
            </p>
            <div v-if="field.options" class="mt-2 flex flex-wrap gap-1">
              <span
                v-for="(option, idx) in field.options.slice(0, 3)"
                :key="idx"
                class="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded"
              >
                {{ typeof option === 'string' ? option : option.label }}
              </span>
              <span
                v-if="field.options.length > 3"
                class="inline-block px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400"
              >
                +{{ field.options.length - 3 }} more
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else class="text-center py-8">
    <UIcon name="i-heroicons-document-text" class="text-4xl text-gray-300 dark:text-gray-700 mx-auto mb-2" />
    <p class="text-sm text-gray-600 dark:text-gray-400">No form schema selected</p>
  </div>
</template>
