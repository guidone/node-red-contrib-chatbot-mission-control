import React from 'react';

import './panel.scss';

const Panel = ({ children }) => (
  <div className="ui-grid-panel">{children}</div>
);


Panel.Title = ({ children }) => (
  <div className="ui-panel-title">{children}</div>
);


export default Panel;