import React from 'react';

import { plug } from 'code-plug';

import { HelpElements, withConfigurationPage } from '../../src/components';
const { NodeRedNode, SlugHelp, TypeCommand } = HelpElements;
import ConfigurationForm from './views/form';

const Legend = () => (
  <div>
    <NodeRedNode>New User</NodeRedNode>
    <p>Select the message to show when a new user joins the chatbot by selecting a <em>slug</em> from the <strong>Content</strong> section.</p>
    <SlugHelp/>
    <p>To test message type <TypeCommand>/start</TypeCommand> in the chatbot</p>
  </div>
);

plug('sidebar', null, {
  permission: 'configure',
  id: 'configuration',
  label: 'Configuration',
  icon: 'cog',
  options: [
    {
      id: 'welcome-message',
      label: 'Welcome Message',
      url: '/welcome',
    }
  ]
});
plug(
  'pages',
  withConfigurationPage(
    'survey',
    ConfigurationForm,
    { Legend, title: 'Welcome message' }
  ),
  {
    permission: 'configure',
    url: '/welcome',
    title: 'Welcome Message',
    id: 'page-welcome-message'
  }
);
