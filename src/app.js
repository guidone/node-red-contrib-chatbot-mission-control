import React, { useReducer, useEffect, useState, useMemo} from 'react';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createHttpLink } from 'apollo-link-http';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from "apollo-link";
import { ApolloProvider } from 'react-apollo';
import { Container, Content, Loader } from 'rsuite';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom';

import { CodePlug } from '../lib/code-plug';

import compose from './helpers/compose-reducers';
import withState from './wrappers/with-state';
import AppContext from './common/app-context';
import Sidebar from './layout/sidebar';
import Header from './layout/header';
import HomePage from './pages/home';
import WebSocket from './common/web-socket';


// Import plugins
import './permissions';
import '../plugins';

const cache = new InMemoryCache(); // where current data is stored
const apolloLink = createHttpLink({ uri: '/graphql' });

const client = new ApolloClient({
  cache,
  link: ApolloLink.from([apolloLink])
});


const initialState = {
  count: 0,
  user: null
};

/*function reducer1(state, action) {
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


      return state;
    default:
      return state;
  }
}
plug('reducers', SocketReducers);*/


//plug('reducers', reducer1);
//plug('reducers', reducer2);


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
        <WebSocket dispatch={dispatch}>
          <Router basename="/mc/">
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
                          <Route key={props.url} path={props.url} children={<View {...props} dispatch={dispatch}/>}>

                          </Route>
                        ))}
                      <Route path="/" children={<HomePage dispatch={dispatch} codePlug={codePlug} />}>
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

const App = ({ bootstrap }) => (
  <CodePlug>
    {codePlug => <AppRouter codePlug={codePlug} bootstrap={bootstrap}/>}
  </CodePlug>
);

export default App;