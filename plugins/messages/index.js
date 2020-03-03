import { plug } from '../../lib/code-plug';

import MessageLogs from './pages/message-logs';

plug('sidebar', null, { 
  id: 'message-log', 
  label: 'Message Logs', 
  url: '/messages', 
  icon: 'comment',
  options: [
    { label: 'Messages', url: '/messages', id: 'messages-logs' },
    { label: 'Unhandled', url: '/messages?flag=not_understood', id: 'messages-not-understood' }
  ] 
})
plug('pages', MessageLogs, { url: '/messages', title: 'Message Logs', id: 'message-log' });