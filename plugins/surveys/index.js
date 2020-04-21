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

plug('pages', UserRecords, {
  url: '/surveys',
  title: 'Surveys',
  id: 'surveys',
  type: 'survey',
  breadcrumbs: ['Knowledge Base', 'Surveys'],
  labels: {
    // saveContent: 'Save article'
  }
});