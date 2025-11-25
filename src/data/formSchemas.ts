export interface FormSchema {
  id: string;
  name: string;
  description: string;
  schema: any[];
}

export const formSchemas: FormSchema[] = [
  {
    id: 'hands-on-challenge-submission',
    name: 'Hands-On Challenge Submission',
    description: 'Complete form for hands-on challenge submissions with project upload and consent',
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
  },
  {
    id: 'simple-submission',
    name: 'Simple Project Submission',
    description: 'Basic form for project submissions with GitHub/deployment link',
    schema: [
      {
        $formkit: "text",
        name: "project_name",
        label: "Project Name",
        placeholder: "Enter your project name",
        validation: "required"
      },
      {
        $formkit: "textarea",
        name: "project_description",
        label: "Project Description",
        placeholder: "Describe what your project does",
        validation: "required"
      },
      {
        $formkit: "url",
        name: "project_link",
        label: "Project Link (GitHub/Demo)",
        placeholder: "https://github.com/your-project",
        validation: "required|url"
      },
      {
        $formkit: "textarea",
        name: "what_you_learned",
        label: "What Did You Learn?",
        placeholder: "Share your learning experience"
      }
    ]
  },
  {
    id: 'blog-submission',
    name: 'Blog Post Submission',
    description: 'Specialized form for blog post submissions',
    schema: [
      {
        $formkit: "text",
        name: "blog_title",
        label: "Blog Title",
        placeholder: "Enter your blog post title",
        validation: "required"
      },
      {
        $formkit: "textarea",
        name: "blog_summary",
        label: "Blog Summary",
        placeholder: "Brief summary of your blog post",
        validation: "required"
      },
      {
        $formkit: "url",
        name: "blog_link",
        label: "Blog Post URL",
        placeholder: "https://medium.com/your-post",
        validation: "required|url"
      },
      {
        $formkit: "select",
        name: "blog_category",
        label: "Category",
        validation: "required",
        options: [
          "AWS",
          "Cloud Computing",
          "DevOps",
          "Frontend",
          "Backend",
          "Full Stack",
          "Other"
        ]
      },
      {
        $formkit: "checkbox",
        name: "agree_to_share",
        label: "I agree to have this blog shared on official channels",
        validation: "accepted"
      }
    ]
  },
  {
    id: 'video-submission',
    name: 'Video Tutorial Submission',
    description: 'Form for video tutorial submissions',
    schema: [
      {
        $formkit: "text",
        name: "video_title",
        label: "Video Title",
        placeholder: "Enter your video title",
        validation: "required"
      },
      {
        $formkit: "textarea",
        name: "video_description",
        label: "Video Description",
        placeholder: "What does your video tutorial cover?",
        validation: "required"
      },
      {
        $formkit: "url",
        name: "video_link",
        label: "YouTube/Video Link",
        placeholder: "https://youtube.com/watch?v=...",
        validation: "required|url"
      },
      {
        $formkit: "select",
        name: "video_duration",
        label: "Video Duration",
        options: ["< 5 minutes", "5-15 minutes", "15-30 minutes", "30+ minutes"]
      },
      {
        $formkit: "textarea",
        name: "key_topics",
        label: "Key Topics Covered",
        placeholder: "List main topics your video covers",
        help: "e.g., AWS Lambda, API Gateway, S3 etc."
      }
    ]
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