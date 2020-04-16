import { plug } from '../../lib/code-plug';

import ConfigurationPage from './pages/configuration';
console.log('Starting welcome plugin');
plug('sidebar', null, {
  permission: 'configure',
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
  permission: 'configure',
  url: '/welcome',
  title: 'Welcome Message',
  id: 'page-welcome-message'
});
