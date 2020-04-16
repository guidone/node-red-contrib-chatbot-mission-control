import { plug } from '../../lib/code-plug';

import Users from './pages/admins';

plug('sidebar', null, { id: 'admins', label: 'Admins', url: '/admins', icon: 'group' })
plug('pages', Users, { url: '/admins', title: 'Admins', id: 'admins' });