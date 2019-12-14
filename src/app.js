import React, { useReducer } from 'react';
import { Button, Container, Navbar, Dropdown, Nav, Footer, Content, Icon } from 'rsuite';
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

// Plugins
import './plugins/send-message/index';


 
// const socket = io('ws://localhost:1880/comms');



import Sockette from 'sockette';

const ws = new Sockette('ws://localhost:1942', {
  timeout: 5e3,
  maxAttempts: 10,
  onopen: e => console.log('Connected!', e),
  onmessage: e => console.log('Received:', e),
  onreconnect: e => console.log('Reconnecting...', e),
  onmaximum: e => console.log('Stop Attempting!', e),
  onclose: e => console.log('Closed!', e),
  onerror: e => console.log('Error:', e)
});

const MyView1 = () => <div>My view 1</div>;
MyView1.displayName = 'uno';
const MyView2 = () => <div>My view 2</div>;
MyView2.displayName = 'due';

// clone schema https://demo.uifort.com/bamburgh-admin-dashboard-pro/

plug('items', MyView1);
plug('items', MyView2);


plug('sidebar', null, { id: 'item-1', label: 'My Item 1', url: '/mc/page1', icon: 'dashboard' })
plug('sidebar', null, { id: 'item-2', label: 'My Item 2', url: 'page2' })

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
const reducer = compose(reducer1, reducer2);






const App = () => {

  const [state, dispatch] = useReducer(reducer, initialState);

    return (
      <AppContext.Provider value={state}>
      <CodePlug>
        {codePlug => (
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
                      <HomePage dispatch={dispatch}/>
                    </Route>
                  </Switch>
                </Content>
              </Container>
            </Container>
          </div>
        </Router>
        )}        
      </CodePlug>
      </AppContext.Provider>
    );
 

}

export default App;