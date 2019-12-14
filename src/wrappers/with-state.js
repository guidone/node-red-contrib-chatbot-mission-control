import React from 'react';

import AppContext from '../common/app-context';

export default (Component, fields = []) => {
  return (props) => (
    <AppContext.Consumer>
      {state => {
        let stateProps = {};
        if (fields.length === 0) {
          stateProps = { ...state };
        } else {
          fields.forEach(field => stateProps[field] = state[field]);
        }
        return <Component {...props} {...stateProps}>{props.children}</Component>;
      }}
    </AppContext.Consumer>
  );
};