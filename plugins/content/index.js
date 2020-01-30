import React, { Fragment } from 'react';
import _ from 'lodash';

import { plug } from '../../lib/code-plug';

import Contents from './pages/content'
import Categories from './pages/categories';

plug(
  'sidebar', 
  null, 
  { 
    id: 'content', 
    label: 'Content', 
    url: '/content', 
    icon: 'file-text',
    options: [
      { label: 'Posts', url: '/content' },
      { label: 'Categories', url: '/categories' }
    ] 
  }
);
plug('pages', Contents, { url: '/content', title: 'Content', id: 'contents' });
plug('pages', Categories, { url: '/categories', title: 'Categories', id: 'categories' });