import React from 'react';
import { Button, Container, Header, Navbar, Dropdown, Nav, Footer, Content, Icon, Sidebar, Sidenav, Affix } from 'rsuite';

import { Plugin, CodePlug, Views, plug } from '../../lib/code-plug';


const iconStyles = {
    width: 56,
    height: 56,
    lineHeight: '56px',
    textAlign: 'center'
  };

const headerStyles = {
    padding: 18,
    fontSize: 16,
    height: 56,
    background: '#3b3e66',
    color: ' #fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  };

const NavToggle = ({ expand, onChange }) => {
    return (
      <Navbar appearance="subtle" className="nav-toggle">
        <Navbar.Body>
          <Nav>
            <Dropdown
              placement="topStart"
              trigger="click"
              renderTitle={children => {
                return <Icon style={iconStyles} icon="cog" />;
              }}
            >
              <Dropdown.Item>Help</Dropdown.Item>
              <Dropdown.Item>Settings</Dropdown.Item>
              <Dropdown.Item>Sign out</Dropdown.Item>
            </Dropdown>
          </Nav>
  
          <Nav pullRight>
            <Nav.Item onClick={onChange} style={{ width: 56, textAlign: 'center' }}>
              <Icon icon={expand ? 'angle-left' : 'angle-right'} />
            </Nav.Item>
          </Nav>
        </Navbar.Body>
      </Navbar>
    );
  };
  
  
  
  



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
            {(View, { label, onClick = () => {}, url, icon }) => (
              <Nav.Item eventKey="1" onSelect={onClick} href={url} icon={icon != null ? <Icon icon={icon} /> : null}>
                {label}
              </Nav.Item>    
            )}
          </Views>
          
          <Nav.Item eventKey="1" active icon={<Icon icon="dashboard" />}>
            Dashboard
          </Nav.Item>
          <Nav.Item eventKey="2" icon={<Icon icon="group" />}>
            User Group
            </Nav.Item>
          <Dropdown
            eventKey="3"
            trigger="hover"
            title="Advanced"
            icon={<Icon icon="magic" />}
            placement="rightStart"
          >
            <Dropdown.Item eventKey="3-1">Geo</Dropdown.Item>
            <Dropdown.Item eventKey="3-2">Devices</Dropdown.Item>
            <Dropdown.Item eventKey="3-3">Brand</Dropdown.Item>
            <Dropdown.Item eventKey="3-4">Loyalty</Dropdown.Item>
            <Dropdown.Item eventKey="3-5">Visit Depth</Dropdown.Item>
          </Dropdown>
          <Dropdown
            eventKey="4"
            trigger="hover"
            title="Settings"
            icon={<Icon icon="gear-circle" />}
            placement="rightStart"
          >
            <Dropdown.Item eventKey="4-1">Applications</Dropdown.Item>
            <Dropdown.Item eventKey="4-2">Websites</Dropdown.Item>
            <Dropdown.Item eventKey="4-3">Channels</Dropdown.Item>
            <Dropdown.Item eventKey="4-4">Tags</Dropdown.Item>
            <Dropdown.Item eventKey="4-5">Versions</Dropdown.Item>
          </Dropdown>
        </Nav>
      </Sidenav.Body>
    </Sidenav>
    <NavToggle expand={true} onChange={() => { }} />
  </Sidebar>
  );
};