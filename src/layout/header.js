import React from 'react';
import PropTypes from 'prop-types';
var gravatar = require('gravatar');
import { Button, Container, Header, Navbar, Dropdown, Nav, Footer, Content, Icon, Sidebar, Sidenav, Avatar } from 'rsuite';

import withState from '../wrappers/with-state';

const initials = user => {
  if (user.firstName != null && user.firstName.length !== 0 && user.lastName != null && user.lastName.length !== 0) {
    return user.firstName.substr(0, 1) + user.lastName.substr(0, 1);
  } else if (user.firstName != null && user.firstName.length !== 0 ) {
    return user.firstName.substr(0, 2);
  } else if (user.lastName != null && user.lastName.length !== 0) {
    return user.lastName.substr(0, 2);
  }
  return '';
}

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';

/*
  <Nav.Item>News</Nav.Item>
  <Nav.Item>Products</Nav.Item>
  <Dropdown title="About">
    <Dropdown.Item>Company</Dropdown.Item>
    <Dropdown.Item>Team</Dropdown.Item>
    <Dropdown.Item>Contact</Dropdown.Item>
  </Dropdown>
*/

const AppHeader = ({ user }) => {
  return (
    <Header className="mc-header">
      <Navbar appearance="inverse">
        <Navbar.Body>
          <Nav>
            <Nav.Item renderItem={() => <Link className="rs-nav-item-content" to="/">Home</Link>} />            
          </Nav>
          <Nav pullRight>
            <Dropdown
              className="mc-avatar"
              placement="bottomEnd"
              renderTitle={()=> (
                <Avatar src={user.avatar || gravatar.url(user.email)} circle>{initials(user)}</Avatar>)}
            >
              <Dropdown.Item><b>{`${user.firstName} ${user.lastName}`}</b></Dropdown.Item>
              <Dropdown.Item onSelect={() => window.location = '/'}>Node-RED</Dropdown.Item>
              <Dropdown.Item divider />
              <Dropdown.Item>Logout</Dropdown.Item>
            </Dropdown>
          </Nav>          
        </Navbar.Body>
      </Navbar>
    </Header>
  );
}
AppHeader.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    avatar: PropTypes.string,
    email: PropTypes.string
  })
};

export default withState(AppHeader, ['user']);