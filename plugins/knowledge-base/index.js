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
    options: [
      { label: 'Articles', url: '/knowledge-base', id: 'faqs' },
      { label: 'Categories', url: '/knowledge-base/categories', id: 'faqs-categories' },
      { label: 'Configuration', url: '/knowledge-base/configure', id: 'faqs-configure' }
    ] 
  }
);

plug('pages', Categories, { 
  url: '/knowledge-base/categories', 
  title: 'Categories', 
  id: 'faq-categories', 
  namespace: 'faq',
  breadcrumbs: [
    { title: 'Knowledge Base', url: '/knowledge-base' }, 
    'Configuration'
  ] 
});
plug('pages', Configuration, { 
  url: '/knowledge-base/configure', 
  title: 'Configure', 
  id: 'faqs-configure'
});
plug('pages', Contents, { 
  url: '/knowledge-base', 
  title: 'Knowledge Base', 
  id: 'faqs',
  namespace: 'faq',
  breadcrumbs: ['Knowledge Base', 'Articles'],
  labels: {
    saveContent: 'Save article'
  } 
});