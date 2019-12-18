import React from 'react';
import _ from 'lodash';
import { Breadcrumb } from 'rsuite';
import { Link } from 'react-router-dom';

import './breadcrumbs.scss';
import { withCodePlug } from '../../../lib/code-plug';

const NavLink = props => <Breadcrumb.Item componentClass={Link} {...props} />;
const findPage = (pages = [], id) => pages.find(page => page.props != null && page.props.id === id)

const Breadcrumbs = ({ pages = [], codePlug }) => {
  const installedPages = codePlug.getItems('pages');

  const breadcrumbs = pages.map(page => {
    const foundPage = _.isString(page) ? findPage(installedPages, page) : null;
    if (foundPage != null) {
      return <NavLink key={page} to={foundPage.props.url}>{foundPage.props.title}</NavLink>
    } else if (_.isString(page)) {
      return <Breadcrumb.Item key={page} active>{page}</Breadcrumb.Item>
    } else if (_.isObject(page) && page.title != null) {
      return <NavLink to={page.url} key={page.title}>{page.title}</NavLink>
    }
  });

  return (
    <Breadcrumb className="ui-breadcrumbs">
      <NavLink to="/mc/">Mission Control</NavLink>
      {breadcrumbs}
    </Breadcrumb>
  );
};

export default withCodePlug(Breadcrumbs);
