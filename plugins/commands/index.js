import React from 'react';

import { plug } from 'code-plug';
import { NodeRedNode, SlugHelp, TypeCommand } from '../../src/components/help-elements';
import withConfigurationPage from '../../src/components/configuration-page';

import ConfigurationForm from './views/form';

console.log('eseguo COMMANDS plugin');

const Legend = () => (
  <div>
    <NodeRedNode>Commands</NodeRedNode>
    <p>Use the this node to show some contents in response of some command-like messages from users, this is a perfect place
      to put some statics documents for pricacy or tos (for example <TypeCommand>/privacy</TypeCommand> or <TypeCommand>/terms</TypeCommand>).
    </p>
    <SlugHelp/>
  </div>
);

plug('sidebar', null, {
  id: 'configuration',
  label: 'Configuration',
  permission: 'configure',
  icon: 'cog',
  options: [
    {
      id: 'commands',
      label: 'Commands',
      url: '/configuration-commands',
    }
  ]
});
plug(
  'pages',
  withConfigurationPage(
    'commands',
    ConfigurationForm,
    { Legend, title: 'Commands' }
  ),
  {
    permission: 'configure',
    url: '/configuration-commands',
    title: 'Commands',
    id: 'configuration-commands'
  }
);

export default { name: 'command plugin' };
