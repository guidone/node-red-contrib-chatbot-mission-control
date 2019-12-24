import { plug } from '../../lib/code-plug';

import MessageLogs from './pages/message-logs';

plug('sidebar', null, { id: 'message-log', label: 'Message Logs', url: '/mc/messages', icon: 'comment' })
plug('pages', MessageLogs, { url: '/mc/messages', title: 'Message Logs', id: 'message-log' });