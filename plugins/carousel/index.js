import React from 'react';
import { Icon } from 'rsuite';

import { plug } from '../../lib/code-plug';

//import ConfigurationPage from './pages/configuration';

import withConfigurationPage from '../../src/components/configuration-page';

import ConfigurationForm from './views/form';

const Legend = () => (
  <div>
    Select a list of contents <em>by slug</em>, each of them will appear as a separate card in the chatbot. A slug is used
    to group different articles that represent the same content in different languages. Click on the language label to edit
    the content for a specific language or click on <Icon icon="plus-square"/> to create one.
  </div>
)

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
