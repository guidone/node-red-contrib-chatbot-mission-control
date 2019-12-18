import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';

import './panel.scss';

const Panel = ({ children, title, className, draggable = true, scrollable = false, menu }) => {
  return (
    <div className={classNames('ui-grid-panel', className, { draggable, 'not-scrollable': !scrollable, scrollable } )}>
      {!_.isEmpty(title) && (
        <div className="ui-panel-title">
          {title}
          <div className="menu">{menu}</div>
        </div>
      )}
      <div className="ui-grid-panel-content">
        {children}
      </div>
    </div>
  );
}

Panel.Empty = ({ children }) => <div className="ui-grid-panel-empty">{children}</div>

export default Panel;