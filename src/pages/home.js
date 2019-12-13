import React from 'react';
import { Button, Container, Navbar, Dropdown, Nav, Footer, Content, Icon } from 'rsuite';

import { Views } from '../../lib/code-plug';

class HomePage extends React.Component {

  render() {

    return (
      <div>
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
      </div>
    );

  }

}

export default HomePage;
