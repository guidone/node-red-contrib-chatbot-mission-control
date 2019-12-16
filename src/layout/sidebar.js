import React from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { Dropdown, Nav, Icon, Sidebar, Sidenav } from 'rsuite';

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
            Mission Control
          </div>
        </Sidenav.Header>
        <Sidenav.Body>
          <Nav>
            <Views region="sidebar">
              {(View, { label, onClick = () => {}, url, icon, options }) => {
                if (_.isObject(options)) {
                  return (
                    <Dropdown
                      eventKey="3"
                      trigger="hover"
                      title={label}
                      icon={icon != null ? <Icon icon={icon} /> : null}
                      placement="rightStart"
                      onSelect={(selected, value) => console.log('selected', selected, value)}
                    >
                      {options.map(option => (
                        <NavLink eventKey="3-1" to={url} key={option.id}>{option.label}</NavLink>
                      ))}
                    </Dropdown>
                  );
                } else {
                  return (
                    <Nav.Item 
                      key={label}
                      eventKey="1" 
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