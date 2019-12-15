import React, { Fragment } from 'react';
import Sockette from 'sockette';

const SocketContext = React.createContext({});

class WebSocket extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      ws: null
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const ws = new Sockette('ws://localhost:1942', {
      timeout: 5e3,
      maxAttempts: 10,
      onopen: e => console.log('Connected!', e),
      onmessage: e => {
        let message;
        try {
          message = JSON.parse(e.data);
        } catch(e) {
          // do nothing
        }
        if (message != null) {
          dispatch({ type: 'socket.message', topic: message.topic, payload: message.payload });
        }
      },
      onreconnect: e => console.log('Reconnecting...', e),
      onmaximum: e => console.log('Stop Attempting!', e),
      onclose: e => console.log('Closed!', e),
      onerror: e => console.log('Error:', e)
    });
    this.setState({ ws });
  }

  render() {
    const { ws } = this.state;
    return <SocketContext.Provider value={{ ws, onMessage: this.onMessage }}>{this.props.children}</SocketContext.Provider>;
  }
}

export { WebSocket as default, SocketContext };
