import React, { Fragment } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Icon, IconButton, Tag, List, FlexboxGrid } from 'rsuite';

import { plug } from '../../lib/code-plug';
import Panel from '../../src/components/grid-panel';
import useSocket from '../../src/hooks/socket';

import Contents from './pages/content';

plug('sidebar', null, { id: 'content', label: 'Content', url: '/content', icon: 'comment' })
plug('pages', Contents, { url: '/content', title: 'Content', id: 'content' });