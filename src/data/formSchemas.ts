export interface FormSchema {
  id: string;
  name: string;
  description: string;
  schema: any[];
}

export const formSchemas: FormSchema[] = [
  {
    id: 'basic-submission',
    name: 'Basic Submission Form',
    description: 'Simple form for basic challenge submissions',
    schema: [
      {
        $formkit: 'text',
        name: 'title',
        label: 'Submission Title',
        placeholder: 'Enter your submission title',
        validation: 'required',
      },
      {
        $formkit: 'textarea',
        name: 'description',
        label: 'Description',
        placeholder: 'Describe your submission',
        validation: 'required',
        rows: 4,
      },
      {
        $formkit: 'url',
        name: 'projectUrl',
        label: 'Project URL',
        placeholder: 'https://github.com/your-project',
        validation: 'required|url',
      }
    ]
  },
  {
    id: 'project-submission',
    name: 'Project Submission Form',
    description: 'Detailed form for project submissions',
    schema: [
      {
        $formkit: 'text',
        name: 'projectName',
        label: 'Project Name',
        placeholder: 'Enter your project name',
        validation: 'required',
      },
      {
        $formkit: 'textarea',
        name: 'description',
        label: 'Project Description',
        placeholder: 'Describe your project in detail',
        validation: 'required',
        rows: 5,
      },
      {
        $formkit: 'select',
        name: 'category',
        label: 'Project Category',
        options: [
          'Web Application',
          'Mobile App',
          'API/Backend',
          'DevOps/Infrastructure',
          'Machine Learning',
          'Other'
        ],
        validation: 'required',
      },
      {
        $formkit: 'url',
        name: 'githubUrl',
        label: 'GitHub Repository',
        placeholder: 'https://github.com/username/repo',
        validation: 'required|url',
      },
      {
        $formkit: 'url',
        name: 'liveUrl',
        label: 'Live Demo URL (Optional)',
        placeholder: 'https://your-demo.com',
        validation: 'url',
      }
    ]
  },
  {
    id: 'article-submission',
    name: 'Article Submission Form',
    description: 'Form for submitting technical articles',
    schema: [
      {
        $formkit: 'text',
        name: 'title',
        label: 'Article Title',
        placeholder: 'Enter your article title',
        validation: 'required',
      },
      {
        $formkit: 'textarea',
        name: 'summary',
        label: 'Article Summary',
        placeholder: 'Brief summary of your article',
        validation: 'required',
        rows: 3,
      },
      {
        $formkit: 'select',
        name: 'platform',
        label: 'Publishing Platform',
        options: [
          'Medium',
          'Dev.to',
          'Personal Blog',
          'LinkedIn',
          'Hashnode',
          'Other'
        ],
        validation: 'required',
      },
      {
        $formkit: 'url',
        name: 'articleUrl',
        label: 'Article URL',
        placeholder: 'https://medium.com/@you/article',
        validation: 'required|url',
      },
      {
        $formkit: 'select',
        name: 'topics',
        label: 'Topics Covered',
        options: [
          'AWS Services',
          'Serverless',
          'Frontend Development',
          'Backend Development',
          'DevOps',
          'Machine Learning',
          'Best Practices',
          'Tutorial'
        ],
        multiple: true,
      },
      {
        $formkit: 'submit',
        label: 'Submit Article'
      }
    ]
  },
  {
    id: 'workshop-submission',
    name: 'Workshop Submission Form',
    description: 'Form for workshop and presentation submissions',
    schema: [
      {
        $formkit: 'text',
        name: 'workshopTitle',
        label: 'Workshop Title',
        placeholder: 'Enter workshop title',
        validation: 'required',
      },
      {
        $formkit: 'textarea',
        name: 'description',
        label: 'Workshop Description',
        placeholder: 'Describe what participants will learn',
        validation: 'required',
        rows: 4,
      },
      {
        $formkit: 'select',
        name: 'duration',
        label: 'Workshop Duration',
        options: [
          '30 minutes',
          '1 hour',
          '2 hours',
          '3 hours',
          'Half day',
          'Full day'
        ],
        validation: 'required',
      },
      {
        $formkit: 'url',
        name: 'materialsUrl',
        label: 'Workshop Materials URL',
        placeholder: 'https://github.com/your-workshop-materials',
        validation: 'required|url',
      },
      {
        $formkit: 'url',
        name: 'recordingUrl',
        label: 'Recording URL (Optional)',
        placeholder: 'https://youtube.com/watch?v=...',
        validation: 'url',
      },
      {
        $formkit: 'number',
        name: 'expectedParticipants',
        label: 'Expected Number of Participants',
        placeholder: '20',
        validation: 'required|number|min:1',
      },
      {
        $formkit: 'submit',
        label: 'Submit Workshop'
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