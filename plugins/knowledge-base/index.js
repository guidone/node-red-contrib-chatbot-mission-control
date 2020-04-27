import React, { Fragment } from 'react';
import _ from 'lodash';

import { plug } from '../../lib/code-plug';
import { Contents, Categories } from '../../src/components/content';

import Configuration from './pages/configuration';

plug(
  'sidebar',
  null,
  {
    id: 'knowledgebase',
    label: 'Knowledge Base',
    url: '/knowledge-base',
    icon: 'file-text',
    permission: 'faq.edit',
    options: [
      { label: 'Articles', url: '/knowledge-base', id: 'faqs' },
      { label: 'Categories', url: '/knowledge-base/categories', id: 'faqs-categories' }
    ]
  }
);

plug(
  'sidebar',
  null,
  {
    id: 'knowledgebase',
    label: 'Knowledge Base',
    url: '/knowledge-base',
    icon: 'file-text',
    permission: ['faq.configure', 'configure'],
    options: [
      { label: 'Configuration', url: '/knowledge-base/configure', id: 'faqs-configure' }
    ]
  }
);

plug('pages', Categories, {
  url: '/knowledge-base/categories',
  title: 'Categories',
  id: 'faq-categories',
  permission: 'faq.edit',
  namespace: 'faq',
  breadcrumbs: [
    { title: 'Knowledge Base', url: '/knowledge-base' },
    'Configuration'
  ]
});
plug('pages', Configuration, {
  url: '/knowledge-base/configure',
  title: 'Configure',
  id: 'faqs-configure',
  permission: ['faq.configure', 'configure'],
});
plug('pages', Contents, {
  url: '/knowledge-base',
  title: 'Knowledge Base',
  id: 'faqs',
  namespace: 'faq',
  permission: 'faq.edit',
  breadcrumbs: ['Knowledge Base', 'Articles'],
  labels: {
    saveContent: 'Save article'
  }
});

plug(
  'permissions',
  null,
  {
    permission: 'faq.edit',
    name: 'Edit Kwnowledge base',
    description: 'Add and edit articles of the knowledge base',
    group: 'Knowledge Base'
  }
);
plug(
  'permissions',
  null,
  {
    permission: 'faq.configure',
    name: 'Configure Kwnowledge base',
    description: 'Configure Kwnowledge base',
    group: 'Knowledge Base'
  }
);