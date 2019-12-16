import React, { useReducer } from 'react';
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


 





const MyView1 = () => <div>My view 1</div>;
MyView1.displayName = 'uno';
const MyView2 = () => <div>My view 2</div>;
MyView2.displayName = 'due';

// clone schema https://demo.uifort.com/bamburgh-admin-dashboard-pro/

plug('items', MyView1);
plug('items', MyView2);


plug('sidebar', null, { id: 'item-1', label: 'My Item 1', url: '/mc/page1', icon: 'dashboard' })

/*plug('sidebar', null, { 
  id: 'configuration', 
  label: 'Configuration', 
  url: '/mc/configuration', 
  icon: 'cog',
  options: [
    { id: 'configuration-1', label: 'Configuration 1', url: '/mc/configuration', icon: 'dashboard' },
    { id: 'configuration-2', label: 'Configuration 2', url: '/mc/configuration', icon: 'dashboard' },
    { id: 'configuration-3', label: 'Configuration 3', url: '/mc/configuration', icon: 'dashboard' },
  ] 
});*/

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
    case 'socket.connected':
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


const AppRouter = ({ codePlug }) => {

  const reducers = compose(...codePlug.getItems('reducers').map(item => item.view ));
  const [state, dispatch] = useReducer(reducers, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
  );

};

const App = () => (
  <CodePlug>
    {codePlug => <AppRouter codePlug={codePlug} />}        
  </CodePlug>
);

export default App;