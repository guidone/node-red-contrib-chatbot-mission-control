import React from 'react';
import { Tag } from 'rsuite';

import { plug } from '../../lib/code-plug';
import withConfigurationPage from '../../src/components/configuration-page';

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
      id: 'configuration-hours',
      label: 'Surveys',
      url: '/configuration-surveys',
    }
  ]
});
plug(
  'pages',
  withConfigurationPage(
    'openings',
    ConfigurationForm,
    { Legend, title: 'Surveys' }
  ),
  {
    permission: 'configure',
    url: '/configuration-surveys',
    title: 'Opening Hours',
    id: 'configuration'
  }
);
