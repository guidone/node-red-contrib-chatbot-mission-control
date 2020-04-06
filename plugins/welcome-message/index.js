import { plug } from '../../lib/code-plug';

import ConfigurationPage from './pages/configuration';

plug('sidebar', null, {
  id: 'configuration',
  label: 'Configuration',
  icon: 'cog',
  options: [
    {
      id: 'welcome-message',
      label: 'Welcome Message',
      url: '/welcome',
    }
  ]
});
plug('pages', ConfigurationPage, {
  url: '/welcome',
  title: 'Welcome Message',
  id: 'page-welcome-message'
});
