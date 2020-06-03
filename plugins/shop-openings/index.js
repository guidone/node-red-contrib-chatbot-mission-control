import React, { Component } from 'react';


import { plug } from 'code-plug';

import { withConfigurationPage, HelpElements } from '../../src/components';
const { NodeRedNode, SlugHelp, TypeCommand } = HelpElements;

import ConfigurationForm from './views/form';

const Legend = () => (
  <div>
    <NodeRedNode>Opening Hours node</NodeRedNode>
    <p>Configure the behaviour of this node: customize the
    opening hours and and some additional content (for example to show extra openings, etc).</p>
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
      id: 'configuration-hours',
      label: 'Opening hours',
      url: '/configuration-openings',
    }
  ]
});
plug(
  'pages',
  withConfigurationPage(
    'openings',
    ConfigurationForm,
    { Legend, title: 'Opening Hours' }
  ),
  {
    permission: 'configure',
    url: '/configuration-openings',
    title: 'Opening Hours',
    id: 'configuration'
  }
);
