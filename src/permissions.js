import { plug } from '../lib/code-plug';

// Generic permissions valid for all platform

plug(
  'permissions',
  null,
  {
    permission: '*',
    name: 'All',
    description: 'All permissions',
    group: 'General'
  }
);

plug(
  'permissions',
  null,
  {
    permission: 'configure',
    name: 'Configure',
    description: 'Configure plugins and Mission Control (unless plugin has a specific permission)',
    group: 'General'
  }
);