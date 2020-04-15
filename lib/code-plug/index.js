import React, { Fragment, useContext } from 'react';
import PropTypes from 'prop-types';

// todo generate id aut
// todo add prop-types libyarn d

import CodePlug from './components/code-plug';
import Views from './components/views';
import Plugin from './components/plugin';
import Items from './components/items';
import Consumer from './components/consumer';
import plug from './components/plug';
import withCodePlug from './components/with-code-plug';

import PlugItUserPermissions from './hooks/user-permission';


import PlugItContext from './context';



const useCodePlug = region => {
  const { codePlug }   = useContext(PlugItContext);
  const items = codePlug.getItems(region)

  return {
    items,
    props: items.map(item => item.props)
  };
}


export { CodePlug, Consumer, Views, Items, Plugin, PlugItUserPermissions, plug, withCodePlug, useCodePlug };
