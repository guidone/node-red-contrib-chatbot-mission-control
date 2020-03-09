import React, { Fragment } from 'react';
import _ from 'lodash';

import { plug } from '../../lib/code-plug';

import Contents from '../content/pages/content'
import Categories from '../content/pages/categories';


plug(
  'sidebar', 
  null, 
  { 
    id: 'knowledgebase', 
    label: 'Knowledge Base', 
    url: '/knowledge-base', 
    icon: 'file-text',
    options: [
      { label: 'Content', url: '/knowledge-base', id: 'faqs' },
      { label: 'Categories', url: '/knowledge-base-categories', id: 'faqs-categories' }
    ] 
  }
);
plug('pages', Contents, { 
  url: '/knowledge-base', 
  title: 'Knowledge Base', 
  id: 'faqs',
  namespace: 'faq' 
});
plug('pages', Categories, { 
  url: '/knowledge-base-categories', 
  title: 'Categories', 
  id: 'categories',
  namespace: 'faq' 
});