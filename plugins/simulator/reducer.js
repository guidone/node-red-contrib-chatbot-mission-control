import _ from 'lodash';

const handleMessages = (state, action) => {
  switch(action.type) {    
    case 'socket.message':
      // add message to the right queue
      const { payload, topic } = action;
      // exit if not from simulator
      if (topic !== 'simulator') {
        return state;
      }
      const current = _.isArray(state.messages[payload.transport]) ? state.messages[payload.transport] : [];
      const messages = { 
        ...state.messages, 
        [payload.transport]: [...current, payload]
      }
      return { ...state, messages };
    
    case 'globals':
      // set globals
      return { ...state, globals: action.globals };
      
    case 'params':
      const { params } = action;
      return { 
        ...state, 
        transport: params.chatBot.transport, 
        nodeId: params.chatBot.nodeId,
        language: params.language,
        user: params.user
      };

    default:
      return state; 
  }
};

export default handleMessages;