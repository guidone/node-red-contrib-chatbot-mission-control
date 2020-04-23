import React from 'react';
import { Tag } from 'rsuite';

import { plug } from '../../lib/code-plug';
import withConfigurationPage from '../../src/components/configuration-page';
import { UserRecords } from '../../src/components/user-records/index.js'

import ConfigurationForm from './views/configuration-form';

const Legend = () => (
  <div>
    Survues TBD
  </div>
);

plug('sidebar', null, {
  id: 'configuration',
  label: 'Configuration',
  permission: 'configure',
  icon: 'cog',
  options: [
    {
      id: 'configuration-survey',
      label: 'Surveys',
      url: '/configuration-surveys',
    }
  ]
});

plug('sidebar', null, {
  id: 'surveys',
  label: 'Surveys',
  //permission: 'configure',
  url: '/surveys',
  icon: 'cog',
});
// register a page to configure the survey
plug(
  'pages',
  withConfigurationPage(
    'survey',
    ConfigurationForm,
    { Legend, title: 'Surveys' }
  ),
  {
    permission: 'configure',
    url: '/configuration-surveys',
    title: 'Survey',
    id: 'configuration-surveys'
  }
);
// register a page for user records of type survey
plug('pages', UserRecords, {
  url: '/surveys',
  title: 'Surveys',
  id: 'surveys',
  type: 'survey',
  permission: 'surveys.view',
  breadcrumbs: ['Surveys'],
  labels: {
    // saveContent: 'Save article'
  }
});
// register permissions
plug(
  'permissions',
  null,
  {
    permission: 'surveys.view',
    name: 'View surveys',
    description: `View surveys answered by chatbot users`,
    group: 'Surveys'
  }
);
// register user record type
plug(
  'user-record-types',
  null,
  {
    type: 'survey',
    name: 'Survey',
    list: `Surveys`,
    description: 'Answer to surveys',
    form: ({ record }) => <div>sono il form {record.title}</div>
  }
);
