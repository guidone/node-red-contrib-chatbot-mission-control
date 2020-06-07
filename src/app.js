import React, { useReducer, useEffect, useState, useMemo} from 'react';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createHttpLink } from 'apollo-link-http';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { ApolloProvider } from 'react-apollo';
import { Container, Content, Loader } from 'rsuite';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { split } from 'apollo-link';

// Define the global scope to store the components shared with plugins
if (window.globalLibs == null) {
  window.globalLibs = {};
}

import { CodePlug, Consumer, Views, Items, Plugin, PlugItUserPermissions, plug, withCodePlug, useCodePlug } from 'code-plug';

import compose from './helpers/compose-reducers';
import AppContext from './common/app-context';
import Sidebar from './layout/sidebar';
import Header from './layout/header';
import HomePage from './pages/home';
import WebSocketReact from './common/web-socket';
import PageNotFound from './layout/page-not-found';


import { ModalProvider } from './components/modal';

// add an empty configuration menu, on order to be the first
plug('sidebar', null, {
  id: 'configuration',
  label: 'Configuration',
  permission: 'configure',
  icon: 'cog',
  order: 0,
  options: []
});


// Import plugins
import './components/index';
import './permissions';
import './plugins-core';
import '../plugins';


//import ws from 'ws';




window.define = function(requires, factory) {
  let resolvedRequires = requires.map(lib => {
    if (lib.includes('/components')) {
      return window.globalLibs.Components;
    } else if (window.globalLibs[lib] != null) {
      return window.globalLibs[lib];
    } else {
      console.warn(`Library "${lib}" is not present in the global export list`);
      return {};
    }
  });
  factory(...resolvedRequires);
};

import * as globalReact from 'react';
import * as globalPropTypes from 'prop-types';
import * as globalCodePlug from 'code-plug';
import * as globalLodash from 'lodash';
import * as globalRsuite from 'rsuite';
import * as globalUseHttp from 'use-http';
import * as globalGraphQLTag from 'graphql-tag';
import * as globalReactApollo from 'react-apollo';
window.globalLibs.react = globalReact;
window.globalLibs['prop-types'] = globalPropTypes;
window.globalLibs['code-plug'] = globalCodePlug;
window.globalLibs.lodash = globalLodash;
window.globalLibs.rsuite = globalRsuite;
window.globalLibs['use-http'] = globalUseHttp;
window.globalLibs['graphql-tag'] = globalGraphQLTag;
window.globalLibs['react-apollo'] = globalReactApollo;



const cache = new InMemoryCache(); // where current data is stored
const apolloLink = createHttpLink({ uri: '/graphql' });

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: `ws://localhost:1943/graphql`,
  options: {
    reconnect: true
  },
  //webSocketImpl: WebSocket
});

const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  apolloLink
);

const client = new ApolloClient({
  cache,
  link: ApolloLink.from([link])
});


const initialState = {
  user: null
};



const usePrefetchedData = () => {
  const [platforms, setPlatforms] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [messageTypes, setMessageTypes] = useState([]);
  const [activeChatbots, setActiveChatbots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/redbot/platforms')
      .then(response => response.json())
      .then(response => setPlatforms(response.platforms))
      .then(() => fetch('/redbot/globals'))
      .then(response => response.json())
      .then(response => {
        setEventTypes(response.eventTypes);
        setMessageTypes(response.messageTypes);
        setActiveChatbots(response.activeChatbots);
        setLoading(false);
      });
  }, []);

  return { platforms, eventTypes, messageTypes, activeChatbots, loading };
}


const AppRouter = ({ codePlug, bootstrap }) => {
  const { items } = useCodePlug('pages', { permission: { '$intersect': bootstrap.user.permissions }})
  const { platforms, eventTypes, messageTypes, activeChatbots, loading } = usePrefetchedData();

  const reducers = useMemo(() => compose(...codePlug.getItems('reducers').map(item => item.view )));
  const [state, dispatch] = useReducer(reducers, { ...initialState, ...bootstrap });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '250px' }}>
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <ApolloProvider client={client}>
      <AppContext.Provider value={{ state, dispatch, client, platforms, eventTypes, messageTypes, activeChatbots }}>
        <WebSocketReact dispatch={dispatch}>
          <ModalProvider>
            <Router basename="/mc">
              <div className="mission-control-app">
                <Container className="mc-main-container">
                  <Sidebar/>
                  <Container className="mc-inner-container">
                    <Header/>
                    <Content className="mc-inner-content">
                      <Switch>
                        {items.map(({ view: View, props }) => (
                          <Route key={props.url} path={props.url} children={<View {...props} dispatch={dispatch}/>} />
                        ))}
                        <Route exact path="/" children={<HomePage dispatch={dispatch} codePlug={codePlug} />}/>
                        <Route path="*" component={PageNotFound} />
                      </Switch>
                    </Content>
                  </Container>
                </Container>
              </div>
            </Router>
          </ModalProvider>
        </WebSocketReact>
      </AppContext.Provider>
    </ApolloProvider>
  );

};

const App = ({ bootstrap }) => (
  <CodePlug>
    {codePlug => <AppRouter codePlug={codePlug} bootstrap={bootstrap}/>}
  </CodePlug>
);

export default App;