import { plug } from '../../lib/code-plug';

import Users from './pages/users';

plug('sidebar', null, { id: 'users', label: 'Users', url: '/users', icon: 'group' })
plug('pages', Users, { url: '/users', title: 'Users', id: 'users' });

plug(
  'permissions',
  null,
  {
    permission: 'users.edit',
    name: 'Edit users',
    description: 'Edit or delete a user',
    group: 'Users'
  }
);
plug(
  'permissions',
  null,
  {
    permission: 'users.context.edit',
    name: 'Edit context',
    description: 'Edit persisted user context',
    group: 'Users'
  }
);
plug(
  'permissions',
  null,
  {
    permission: 'users.context.view',
    name: 'View context',
    description: 'View persisted user context',
    group: 'Users'
  }
);
plug(
  'permissions',
  null,
  {
    permission: 'users.merge',
    name: 'Merge user',
    description: 'Merge a user into another (mergings chatIds and contexts)',
    group: 'Users'
  }
);