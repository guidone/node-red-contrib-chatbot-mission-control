import React from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { Dropdown, Nav, Icon, Sidebar, Sidenav } from 'rsuite';

import Logo from '../components/logo';
import { Views } from '../../lib/code-plug';

const NavLink = props => <Dropdown.Item componentClass={Link} {...props} />;

export default () => {
  return (
    <Sidebar
      className="mc-sidebar"
      style={{ display: 'flex', flexDirection: 'column', height: '100vh', 'position': 'fixed' }}
      width={260}
      collapsible
    >
      <Sidenav
        expanded={true}
        defaultOpenKeys={['3']}
        appearance="subtle"
      >
        <Sidenav.Header>
          <div className="mc-sidebar-header">
            <Logo />
          </div>
        </Sidenav.Header>
        <Sidenav.Body className="mc-sidebar-body">
          <Nav>
            <Views region="sidebar">
              {(View, { label, onClick = () => {}, url, icon, options, id }) => {
                if (_.isArray(options)) {
                  return (
                    <Dropdown
                      eventKey="3"
                      trigger="hover"
                      title={label}
                      key={id}
                      icon={icon != null ? <Icon icon={icon} /> : null}
                      placement="rightStart"
                    >
                      {options.map(option => (
                        <NavLink 
                          eventKey="3-1" 
                          to={option.url}
                          key={option.id}                          
                        >{option.label}</NavLink>
                      ))}
                    </Dropdown>
                  );
                } else {
                  return (
                    <Nav.Item 
                      key={label}
                      eventKey="1"
                      key={id} 
                      onSelect={onClick} 
                      href={url} 
                      renderItem={children => (
                        <Link className="rs-nav-item-content" to={url}>{icon != null ? <Icon icon={icon} /> : null}{label}</Link>
                      )}
                    >
                      {label}
                    </Nav.Item>    
                  );
                }
              }}
            </Views>
          </Nav>
        </Sidenav.Body>
      </Sidenav>
    </Sidebar>
  );
};