import { plug } from '../../lib/code-plug';

import ConfigurationTest from './pages/configuration';

plug('sidebar', null, { 
  id: 'configuration', 
  label: 'Configuration',    
  icon: 'cog',
  options: [
    {
      id: 'configuration-test',
      label: 'Test', 
      url: '/mc/configuration-test',
    }
  ] 
});
plug('pages', ConfigurationTest, { 
  url: '/mc/configuration-test', 
  title: 'Configuration Test', 
  id: 'configuration' 
});

