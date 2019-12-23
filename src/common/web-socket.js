import React from 'react';
import { Notification } from 'rsuite';

import socketListener from '../../lib/socket';
const SocketContext = React.createContext({});

class WebSocket extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      ws: null
    };
  }

  onMessage = (topic, payload) => this.props.dispatch({ type: 'socket.message', topic, payload });
  onOpen = () => {
    this.props.dispatch({ type: 'socket.open' });
    Notification.success({ title: 'Connected!'});
  }

  componentDidMount() {
    socketListener
      .on('message', this.onMessage)
      .on('open', () => this.onOpen());
  }

  componentWillUnmount() {
    socketListener
      .off('message', this.onMessage)
      .off('open', this.onOpen);
  }

  render() {
    const { ws } = this.state;
    return <SocketContext.Provider value={{ socketListener }}>{this.props.children}</SocketContext.Provider>;
  }
}

export { WebSocket as default, SocketContext };
