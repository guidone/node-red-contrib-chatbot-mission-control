import React from 'react';
import { Button, Container, Navbar, Dropdown, Nav, Footer, Content, Icon } from 'rsuite';


import { Plugin, CodePlug, Views, plug } from '../lib/code-plug';

import WebSocket from 'ws';
 
// const socket = io('ws://localhost:1880/comms');

import Sidebar from './layout/sidebar';
import Header from './layout/header';


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


plug('sidebar', null, { label: 'My Item 1', onClick: () => alert('clicked 1'), url: '/page1', icon: 'dashboard' })
plug('sidebar', null, { label: 'My Item 2', onClick: () => alert('clicked 2'), url: '/page12' })


class App extends React.Component {


  render() {

    return (
      <CodePlug>
        <div className="mission-control-app">        
          <Container className="mc-main-container">          
            <Sidebar/>
            <Container className="mc-inner-container">            
              <Header/>
              <Content className="mc-inner-content">

                <Views region="items"/>
                bella secco
            

                <div style={{width: '250px', height: '250px', backgroundColor: 'red'}}></div>
                <div style={{width: '250px', height: '250px', backgroundColor: 'yellow'}}></div>
                <div style={{width: '250px', height: '250px', backgroundColor: 'green'}}></div>
                <div style={{width: '250px', height: '250px', backgroundColor: 'red'}}></div>
                <div style={{width: '250px', height: '250px', backgroundColor: 'yellow'}}></div>
                <div style={{width: '250px', height: '250px', backgroundColor: 'green'}}></div>

                <div className="title">sono ross</div> 

                <Button onClick={() => ws.send(JSON.stringify({ topic: 'send', payload: 'bella secco!' }))}>Allora?</Button>

              </Content>
            </Container>
          </Container>
        </div>
      </CodePlug>
    );
  }

}

export default App;