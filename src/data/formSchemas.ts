export interface FormSchema {
  id: string;
  name: string;
  description: string;
  schema: any[];
}

export interface FormSchema {
  id: string;
  name: string;
  description: string;
  schema: any[];
}

export const formSchemas: FormSchema[] = [
  {
    id: 'hands-on-challenge-submission',
    name: 'Hands-On Chanllenge Submission Form',
    description: 'Hands-On Chanllenge Submission Form',
    schema: [{
      $formkit: "radio",
      name: "college_cloud_champs",
      label: "Are you part of College Cloud Champs / Club Event?",
      validation: "required",
      options: [
        {
          label: "Yes",
          value: "yes"
        },
        {
          label: "No",
          value: "no"
        }
      ]
    },
    {
      $formkit: "text",
      name: "college_name",
      label: "If Yes, Mention the college",
    },
    {
      $formkit: "select",
      name: "submission_type",
      label: "Type of submission",
      validation: "required",
      placeholder: "Select submission type",
      options: [
        "Blog Post",
        "Video Tutorial",
      ]
    },
    {
      $formkit: "url",
      name: "projectUrl",
      label: "Submit (Google Drive link / URL if already posted)",
      validation: "required|url",
    },
    {
      $formkit: "file",
      name: "projectFile",
      label: "Upload Your File",
      placeholder: "Upload a file related to your submission",
      accept: ".pdf,.zip,.jpg,.png,.doc,.docx,.mov,.mp4,.mkv,.avi,.md",
      help: "Max file size: 100MB",
      onInput: "$handlers.handleFileUpload"
    },
    {
      $formkit: "hidden",
      name: "projectFileUrl",
      value: ""
    },
    {
      $formkit: "radio",
      name: "consent_posting",
      label: "Do you consent to post it from @awsugmdu handles (Instagram, Linkedin, Twitter). We will mention creator in the caption of the post.",
      validation: "required",
      options: [
        {
          label: "Yes",
          value: "yes"
        },
        {
          label: "No",
          value: "no"
        }
      ]
    },
    {
      $formkit: "checkbox",
      name: "acknowledge_rules",
      label: "I have acknowledged the rules and regulations of the submission",
      validation: "required|accepted",
      value: false
    },
    {
      $formkit: "textarea",
      name: "additional_info",
      label: "Any Additional information for organisers?",
      validation: "required",
    },
    {
      $formkit: "textarea",
      name: "feedback",
      label: "Feedback",
      validation: "required",
    }]
  }
];

export const getFormSchemaById = (id: string): FormSchema | undefined => {
  return formSchemas.find(schema => schema.id === id);
};

export const getFormSchemaOptions = () => {
  return formSchemas.map(schema => ({
    label: schema.name,
    value: schema.id,
    description: schema.description
  }));
};

export const getFormSchemaName = (id: string): string => {
  const schema = getFormSchemaById(id);
  return schema ? schema.name : 'Unknown Form';
};