import { plug } from '../../lib/code-plug';

import ConfigurationPage from './pages/configuration';

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
plug('pages', ConfigurationPage, {
  permission: 'configure',
  url: '/configuration-openings',
  title: 'Opening Hours',
  id: 'configuration'
});
