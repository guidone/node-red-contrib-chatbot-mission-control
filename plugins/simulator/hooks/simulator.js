import { useContext } from 'react';

import useSocket from '../../../src/hooks/socket';

import SimulatorContext from '../context';

const useSimulator = () => {

  const { sendMessage } = useSocket();
  const { messages, transport, nodeId, language, user } = useContext(SimulatorContext);


  return {
    sendMessage: text => {
      console.log('send', sendMessage);
      console.log('mess', messages, transport, user)
    }
  }

};

export default useSimulator;