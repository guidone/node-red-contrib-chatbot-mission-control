import { plug } from '../../lib/code-plug';

import SuspendForm from './views/suspend-form';

plug('user-tabs', SuspendForm, { 
  id: 'suspend-user',
  label: 'Suspend' 
});
