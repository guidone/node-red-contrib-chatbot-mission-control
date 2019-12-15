import React from 'react';

import { SocketContext } from '../common/web-socket';

export default (Component) => {
  return (props) => (
    <SocketContext.Consumer>
      {({ ws, onMessage }) => (
        <Component 
          {...props} 
          sendMessage={ws != null ? (topic, payload) => ws.send(JSON.stringify({ topic, payload })) : () => {}}
        >
          {props.children}
        </Component>
      )}
    </SocketContext.Consumer>
  );
};