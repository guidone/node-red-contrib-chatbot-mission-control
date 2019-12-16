import React from 'react';
import _ from 'lodash';

import './panel.scss';

const Panel = ({ children, title }) => {
  return (
    <div className="ui-grid-panel">
      {!_.isEmpty(title) && <div className="ui-panel-title">{title}</div>}
      <div className="ui-grid-panel-content">
        {children}
      </div>
    </div>
  );
}


Panel.Title = ({ children }) => (
  <div className="ui-panel-title">{children}</div>
);


export default Panel;