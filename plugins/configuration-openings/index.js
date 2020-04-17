import React from 'react';
import { Tag } from 'rsuite';

import { plug } from '../../lib/code-plug';
import withConfigurationPage from '../../src/components/configuration-page';

import ConfigurationForm from './views/form';

const Legend = () => (
  <div>
    Configure the behaviour of the <Tag color="violet">Opening Hours node</Tag>, setting the list of
    opening hours and an extra content to show extra openings, etc
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
      label: 'Opening hours',
      url: '/configuration-openings',
    }
  ]
});
plug(
  'pages',
  withConfigurationPage(
    'openings',
    ConfigurationForm,
    { Legend, title: 'Opening Hours' }
  ),
  {
    permission: 'configure',
    url: '/configuration-openings',
    title: 'Opening Hours',
    id: 'configuration'
  }
);
