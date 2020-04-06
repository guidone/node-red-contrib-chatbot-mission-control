import { plug } from '../../lib/code-plug';

import ConfigurationPage from './pages/configuration';

plug('sidebar', null, {
  id: 'configuration',
  label: 'Configuration',
  icon: 'cog',
  options: [
    {
      id: 'carousel',
      label: 'Carousel',
      url: '/configuration-carousel',
    }
  ]
});
plug('pages', ConfigurationPage, {
  url: '/configuration-carousel',
  title: 'Carousel',
  id: 'configuration-carousel'
});
