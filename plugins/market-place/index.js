import React from 'react';
import { plug } from 'code-plug';

import { withConfigurationPage, Content } from '../../src/components';

import PublishPlugins from './views/publish-plugins';
import ConfigureMarketPlace from './views/configure-market-place';
import DefaultConfiguration from './views/default-configuration';

const Legend = () => (
  <div>
    Configure the id and the key to access <strong>jsonbing.io</strong> for the plugins met information.
    <br />
    Docs about the API <a href="https://jsonbin.io/api-reference/bins/read" target="blank">here</a>.
  </div>
);

plug(
  'sidebar',
  null,
  {
    id: 'market-place',
    label: 'Market Place',
    url: '/market-place',
    icon: 'shopping-basket'
  }
);

plug('sidebar', null, {
  id: 'configuration',
  label: 'Configuration',
  permission: 'configure',
  icon: 'cog',
  options: [
    {
      id: 'configuration-market-place',
      label: 'Market Place',
      url: '/configuration-market-place',
    }
  ]
});

plug(
  'pages',
  withConfigurationPage(
    'market-place',
    ConfigureMarketPlace,
    { Legend, title: 'Market Place' }
  ),
  {
    permission: 'configure',
    url: '/configuration-market-place',
    title: 'Market Place',
    id: 'configuration'
  }
);


plug('pages', Content.Contents, {
  url: '/market-place',
  title: 'Market Place',
  id: 'market-place',
  namespace: 'plugins',
  breadcrumbs: ['Market Place', 'Plugins'],
  labels: {
    saveContent: 'Save plugin',
    createContent: 'Create plugin',
    emptyContent: 'No plugins',
  },
  custom: () => <PublishPlugins />,
  customFieldsSchema: [
    {
      key: 'url',
      type: 'string',
      description: `URL of the compiled plugin`,
      color: 'cyan'
    },
    {
      key: 'flow',
      type: 'string',
      description: `URL of the Node-RED flow for this plugin`,
      color: 'cyan'
    },
    {
      key: 'id',
      type: 'string',
      description: `Unique id of the plugin`,
      color: 'red'
    },
    {
      key: 'version',
      type: 'string',
      description: `The version of the current (latest) plugin`,
      color: 'red'
    },
    {
      key: 'github',
      type: 'string',
      description: `The URL of the github page of the plugin`,
      color: 'red'
    },
    {
      key: 'author',
      type: 'string',
      description: `The username of the author of the plugin`,
      color: 'orange'
    },
    {
      key: 'author_url',
      type: 'string',
      description: `The home page of the username, if any`,
      color: 'orange'
    },
    {
      key: 'tags',
      type: 'tags',
      description: `List of keywords, comma separated`,
      color: 'red'
    }
  ]
});

plug('content-tabs', DefaultConfiguration, {
  id: 'content-configuration',
  label: 'Configuration',
  namespace: ['plugins']
});