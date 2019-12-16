import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';

import './panel.scss';

const Panel = ({ children, title, className }) => {
  return (
    <div className={classNames('ui-grid-panel', className)}>
      {!_.isEmpty(title) && <div className="ui-panel-title">{title}</div>}
      <div className="ui-grid-panel-content">
        {children}
      </div>
    </div>
  );
}

export default Panel;