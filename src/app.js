import React, { useReducer, useEffect, useState } from 'react';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createHttpLink } from 'apollo-link-http';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from "apollo-link";
import { ApolloProvider } from 'react-apollo';
import { Button, Container, Navbar, Dropdown, Nav, Footer, Content, Icon, Notification } from 'rsuite';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';

import { Plugin, CodePlug, Views, plug } from '../lib/code-plug';

import compose from './helpers/compose-reducers';
import withState from './wrappers/with-state';
import AppContext from './common/app-context';


import Sidebar from './layout/sidebar';
import Header from './layout/header';
import HomePage from './pages/home';
import WebSocket from './common/web-socket';

// Import plugins
import '../plugins';




const cache = new InMemoryCache(); // where current data is stored
const apolloLink = createHttpLink({ uri: '/graphql' });

const client = new ApolloClient({
  cache,
  link: ApolloLink.from([apolloLink])
});




const MyView1 = () => <div>My view 1</div>;
MyView1.displayName = 'uno';
const MyView2 = () => <div>My view 2</div>;
MyView2.displayName = 'due';


plug('items', MyView1);
plug('items', MyView2);


plug('sidebar', null, { id: 'item-1', label: 'My Item 1', url: '/mc/page1', icon: 'dashboard' })



plug('pages', MyView1, { url: '/mc/page1' });


const initialState = {
  count: 0,
  user: 'guidone'
};
function reducer1(state, action) {
  switch (action.type) {
    case 'increment':
      return {...state, count: state.count + 1};
    case 'decrement':
      return {...state, count: state.count - 1};
    default:
      return state;
  }
}

function reducer2(state, action) {

  switch (action.type) {
    case 'user':
      return {...state, user: state.user + '*'};
    default:
      return state;
  }
}

function SocketReducers(state, action) {
  switch(action.type) {
    case 'socket.open':
      Notification.success({ title: 'Connected!'});
      return state;
    default:
      return state;
  }
}
plug('reducers', SocketReducers);


plug('reducers', reducer1);
plug('reducers', reducer2);

// TODO
// wrapper per il socket passandogli il dispatch
// home page con le tiles


const usePrefetchedData = () => {
  
  const [platforms, setPlatforms] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [messageTypes, setMessageTypes] = useState([]);

  useEffect(() => {
    fetch('/redbot/platforms')
      .then(response => response.json())
      .then(response => {
        console.log('caricato')
        setPlatforms(response.platforms);
      })
      .then(() => fetch('/redbot/globals'))
      .then(response => response.json())
      .then(response => {
        console.log('caricato', response)
        setEventTypes(response.eventTypes);
        setMessageTypes(response.messageTypes);
      })


  }, []);

  return { platforms, eventTypes, messageTypes };
}


const AppRouter = ({ codePlug }) => {
  const { platforms, eventTypes, messageTypes } = usePrefetchedData();
  const reducers = compose(...codePlug.getItems('reducers').map(item => item.view ));
  const [state, dispatch] = useReducer(reducers, initialState);
console.log('REFRESH APP-->')
  return (
    <ApolloProvider client={client}>
      <AppContext.Provider value={{ state, dispatch, client, platforms, eventTypes, messageTypes }}>
        <WebSocket dispatch={dispatch}>
          <Router>
            <div className="mission-control-app">        
              <Container className="mc-main-container">          
                <Sidebar/>
                <Container className="mc-inner-container">            
                  <Header/>
                  <Content className="mc-inner-content">
                    <Switch>                              
                      {codePlug
                        .getItems('pages')
                        .map(({ view: View, props }) => (
                          <Route key={props.url} path={props.url}>
                            <View {...props} dispatch={dispatch}/>
                          </Route>
                        ))}
                      <Route path="/mc">
                        <HomePage dispatch={dispatch} codePlug={codePlug} />
                      </Route>
                    </Switch>
                  </Content>
                </Container>
              </Container>
            </div>
          </Router>
        </WebSocket>
      </AppContext.Provider>
    </ApolloProvider>
  );

};

const App = () => (
  <CodePlug>
    {codePlug => <AppRouter codePlug={codePlug} />}        
  </CodePlug>
);

export default App;