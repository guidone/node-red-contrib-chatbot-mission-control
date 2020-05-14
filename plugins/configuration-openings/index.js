import React from 'react';
import { Tag } from 'rsuite';

import { plug } from '../../lib/code-plug';
import withConfigurationPage from '../../src/components/configuration-page';
import { NodeRedNode, SlugHelp } from '../../src/components/help-elements';

import ConfigurationForm from './views/form';

const Legend = () => (
  <div>
    <NodeRedNode>Opening Hours node</NodeRedNode>
    <p>Configure the behaviour of this node: customize the
    opening hours and and some additional content (for example to show extra openings, etc).</p>
    <SlugHelp/>
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
