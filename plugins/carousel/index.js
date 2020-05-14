import React from 'react';

import { plug } from '../../lib/code-plug';
import { NodeRedNode, SlugHelp } from '../../src/components/help-elements';
import withConfigurationPage from '../../src/components/configuration-page';

import ConfigurationForm from './views/form';

const Legend = () => (
  <div>
    <NodeRedNode>Cards</NodeRedNode>
    <p>Configure the carousel of cards to show in the chabot: select one or more <em>slugs</em> from the <strong>Content</strong> section.</p>
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
      id: 'carousel',
      label: 'Carousel',
      url: '/configuration-carousel',
    }
  ]
});
plug(
  'pages',
  withConfigurationPage(
    'carousel',
    ConfigurationForm,
    { Legend, title: 'Carousel' }
  ),
  {
    permission: 'configure',
    url: '/configuration-carousel',
    title: 'Carousel',
    id: 'configuration-carousel'
  }
);
