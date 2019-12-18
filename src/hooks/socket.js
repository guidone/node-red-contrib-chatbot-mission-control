import { useEffect, useReducer } from 'react';

import socketListener from '../../lib/socket';

const useSocket = (reducer = () => {}, initialState = {}) => {
  const handler = (topic, payload) => dispatch({ type: 'socket.message', topic, payload });
  // connect socket
  useEffect(() => {
    socketListener.on('message', handler);
    return () => socketListener.off('message', handler);
  }, []);
  const [state, dispatch] = useReducer(reducer, initialState);

  return { state, dispatch };
}

export default useSocket;