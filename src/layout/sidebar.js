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
          <svg width="150px" height="50px" viewBox="0 0 385 125" version="1.1" preserveAspectRatio="xMidYMin slice">
            <title>Slicemc_logo</title>
            <desc>Created with Sketch.</desc>
            <defs>
                <linearGradient x1="52.7936161%" y1="100%" x2="52.7936161%" y2="39.4877247%" id="linearGradient-1">
                    <stop stop-color="#2B3232" offset="0%"></stop>
                    <stop stop-color="#419BF9" offset="100%"></stop>
                </linearGradient>
            </defs>
            <g id="MissionControl" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <rect id="Rectangle" fill="#F6A623" x="330" y="75" width="45" height="11"></rect>
                <path d="M3,19.999135 C3,10.0584873 11.0543778,2 21.0048666,2 L113.752946,2 C123.696759,2 131.757812,10.0671727 131.757812,19.999135 L131.757812,72.4837219 C131.757812,82.4243697 126.876,90.4828569 126.876,90.4828569 L126.876,90.4828569 C126.876,90.4828569 77.795665,125.265773 78.0578717,125.265773 C77.795665,125.265773 94.5339899,90.4828569 94.5339899,90.4828569 L21.002239,90.4828569 C11.0598769,90.4828569 3,82.4156842 3,72.4837219 L3,19.999135 Z" id="Rectangle-1" fill="url(#linearGradient-1)"></path>
                <rect id="Rectangle-1" fill="#FFFFFF" x="16" y="25" width="103.738522" height="37.8340492" rx="18.9170246"></rect>
                <ellipse id="Oval-1" fill="#419BF8" cx="41.7300985" cy="44.7300985" rx="13.7300985" ry="13.7300985"></ellipse>
                <ellipse id="Oval-1" fill="#4098F3" cx="94.7300985" cy="44.7300985" rx="13.7300985" ry="13.7300985"></ellipse>
                <text id="Mission" font-family="HelveticaNeue-Bold, Helvetica Neue" font-size="48" font-weight="bold" fill="#FFFFFF">
                    <tspan x="145.454325" y="43">Mission</tspan>
                </text>
                <text id="Control" font-family="HelveticaNeue-Bold, Helvetica Neue" font-size="48" font-weight="bold" fill="#FFFFFF">
                    <tspan x="148.390325" y="85">Control</tspan>
                </text>
            </g>
          </svg>
        </div>
        </Sidenav.Header>
        <Sidenav.Body className="mc-sidebar-body">
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