import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import gravatar from 'gravatar';
import { Tooltip, Whisper, Header, Navbar, Dropdown, Nav, Icon, IconButton, Avatar } from 'rsuite';
import { Link, useHistory } from 'react-router-dom';

import AppContext from '../common/app-context';
import useCurrentUser from '../hooks/current-user';

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

const AppHeader = () => {
  const { user } = useCurrentUser();
  const { state } = useContext(AppContext);
  const history = useHistory();
  const { needRestart } = state;

  return (
    <Header className="mc-header">
      <Navbar appearance="inverse">
        <Navbar.Body>
          <Nav>
            <Nav.Item renderItem={() => <Link className="rs-nav-item-content" to="/">Home</Link>} />
            <Nav.Item renderItem={() => <Link className="rs-nav-item-content" to="/plugins">Plugins</Link>} />
          </Nav>
          <Nav pullRight>
            {_.isEmpty(user.password) && (
              <Whisper
                placement="left"
                trigger="hover"
                speaker={<Tooltip>Current user has no password!</Tooltip>}
              >
                <IconButton
                  circle
                  style={{ marginTop: '7px', marginRight: '7px'}}
                  color="red"
                  size="lg"
                  onClick={() => history.push('/admins')}
                  icon={<Icon icon="exclamation-triangle" />}
                />
              </Whisper>
            )}
            {needRestart && (
              <Whisper
                placement="left"
                trigger="hover"
                speaker={<Tooltip>Reload page to see installed plugins</Tooltip>}
              >
                <IconButton
                  circle
                  style={{ marginTop: '7px', marginRight: '7px'}}
                  color="red"
                  size="lg"
                  onClick={() => window.location.reload()}
                  icon={<Icon icon="refresh" />}
                />
              </Whisper>
            )}
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

export default AppHeader;