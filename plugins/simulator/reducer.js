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
      
      let toAdd;
      if (!_.isArray(payload.payload)) {
        toAdd = [payload]
      } else {
        toAdd = payload.payload.map(current => ({ ...payload, ...current, payload: undefined }))
      }
      
      const messages = { 
        ...state.messages, 
        // multiple messages can be enqueued
        [payload.transport]: [
          ...current, 
          ...toAdd
        ]
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