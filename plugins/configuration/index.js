import { plug } from '../../lib/code-plug';

import ConfigurationPage from './pages/configuration';

plug('sidebar', null, { id: 'configuration', label: 'Configuration', url: '/mc/configuration', icon: 'cog' })
plug('pages', ConfigurationPage, { url: '/mc/configuration', title: 'Configuration', id: 'configuration' });

