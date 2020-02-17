import { plug } from '../../lib/code-plug';

import ConfigurationPage from './pages/configuration';

plug('sidebar', null, { 
  id: 'configuration', 
  label: 'Configuration',    
  icon: 'cog',
  options: [
    {
      label: 'Opening hours', 
      url: '/mc/configuration-openings',
    }
  ] 
});
plug('pages', ConfigurationPage, { 
  url: '/mc/configuration-openings', 
  title: 'Configuration', 
  id: 'configuration' 
});

