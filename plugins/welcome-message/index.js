import React from 'react';
import { Tag } from 'rsuite';

import { plug } from '../../lib/code-plug';

import withConfigurationPage from '../../src/components/configuration-page';
import ConfigurationForm from './views/form';

const Legend = () => (
  <div>
    Configure the behaviour of the <Tag color="violet">New User</Tag> node.<br/>
    Select a content to show to the user when he joins the chatbot or a group. Use the <em>slug</em> field
    to group different articles that represents the same content (for example the different translations).<br/>
    To test the show content type <code>/start</code>
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
