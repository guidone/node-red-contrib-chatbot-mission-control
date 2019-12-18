import React from 'react';

import { SocketContext } from '../common/web-socket';

export default (Component) => {
  return (props) => (
    <SocketContext.Consumer>
      {({ socketListener }) => (
        <Component 
          {...props} 
          sendMessage={socketListener != null ? (topic, payload) => socketListener.send(JSON.stringify({ topic, payload })) : () => {}}
        >
          {props.children}
        </Component>
      )}
    </SocketContext.Consumer>
  );
};