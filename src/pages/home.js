import React from 'react';
import { Button, Container, Navbar, Dropdown, Nav, Footer, Content, Icon } from 'rsuite';

import { Views } from '../../lib/code-plug';
import withState from '../wrappers/with-state';
class HomePage extends React.PureComponent {

  render() {

    const { count, dispatch, user } = this.props;
    console.log('home refreshed');
    return (
      <div>
                bella secco <br/>
    <span>count: {count} {user}</span>
        <Views region="items"/>
        <Button onClick={() => dispatch({ type: 'increment' })}>inc</Button>
        <Button onClick={() => dispatch({ type: 'decrement' })}>dec</Button>
        <Button onClick={() => dispatch({ type: 'user' })}>user</Button>

    

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

export default withState(HomePage, ['count']);;
