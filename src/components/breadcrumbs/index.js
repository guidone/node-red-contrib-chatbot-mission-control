import React from 'react';

import { Button, Form, FormControl, ButtonToolbar, FormGroup, ControlLabel, Breadcrumb } from 'rsuite';
import { Link } from 'react-router-dom';

import './breadcrumbs.scss';
const NavLink = props => <Breadcrumb.Item componentClass={Link} {...props} />;

const Breadcrumbs = () => {

  return (
    <Breadcrumb className="ui-breadcrumbs">
      <NavLink to="/mc/">Mission Control</NavLink>
      <NavLink active>Configuration</NavLink>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
