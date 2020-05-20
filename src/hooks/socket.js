import { useEffect, useReducer } from 'react';

import socketListener from '../../lib/socket';

const useSocket = ({ reducer = () => {}, initialState = {}, onMessage = () => {} } = {}) => {
  const handler = (topic, payload) => {
    dispatch({ type: 'socket.message', topic, payload });
    onMessage(topic, payload);
  };
  // connect socket
  useEffect(() => {
    socketListener.on('message', handler);
    return () => socketListener.off('message', handler);
  }, []);
  const [state, dispatch] = useReducer(reducer, initialState);

  return {
    state,
    dispatch,
    sendMessage: (topic, payload) => socketListener.send(JSON.stringify({ topic, payload }))
  };
}

export default useSocket;