import React from 'react';
import { Button, Container, Header, Navbar, Dropdown, Nav, Footer, Content, Icon, Sidebar, Sidenav, Avatar } from 'rsuite';

import withState from '../wrappers/with-state';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';


 const AppHeader = ({ user }) => {
  console.log('refresh header', user)
  return (
    <Header className="mc-header">
      <Navbar appearance="inverse">
        <Navbar.Header>
          <a className="navbar-brand logo">BRAND</a>
        </Navbar.Header>
        <Navbar.Body>
          <Nav>
            <Nav.Item renderItem={() => <Link className="rs-nav-item-content" to="/mc">Home</Link>} />
            <Nav.Item>News</Nav.Item>
            <Nav.Item>Products</Nav.Item>
            <Dropdown title="About">
              <Dropdown.Item>Company</Dropdown.Item>
              <Dropdown.Item>Team</Dropdown.Item>
              <Dropdown.Item>Contact</Dropdown.Item>
            </Dropdown>
          </Nav>
          <Nav pullRight>
            <Dropdown
              className="mc-avatar"
              placement="bottomEnd"
              renderTitle={()=> <Avatar circle>RS</Avatar>}
            >
              <Dropdown.Item ><Icon icon="user" /> New User</Dropdown.Item>
              <Dropdown.Item ><Icon icon="group" /> New Group</Dropdown.Item>
            </Dropdown>
          </Nav>
          
          

          

            
          
        </Navbar.Body>
      </Navbar>

    </Header>
  );
}

export default withState(AppHeader, ['user']);