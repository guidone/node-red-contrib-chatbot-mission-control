import { plug } from '../../lib/code-plug';

import Users from './pages/users';

plug('sidebar', null, { id: 'users', label: 'Users', url: '/mc/users', icon: 'group' })
plug('pages', Users, { url: '/mc/users', title: 'Users', id: 'users' });