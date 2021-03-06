import _ from 'lodash';
import moment from 'moment';

const handleMessages = (state, action) => {

  switch(action.type) {
    case 'message':
      // add message to the right queue
      const { payload, topic } = action;
      // exit if not from simulator
      if (topic !== 'simulator') {
        return state;
      }

      const current = _.isArray(state.simulator.messages[payload.transport]) ? state.simulator  .messages[payload.transport] : [];

      let toAdd;
      if (!_.isArray(payload.payload)) {
        toAdd = { ...payload, ts: moment() }
      } else {
        toAdd = payload.payload.map(current => ({ ...payload, ...current, payload: undefined, ts: moment() }))
      }
      const messages = {
        ...state.messages,
        // multiple messages can be enqueued
        [payload.transport]: [
          ...current,
          toAdd
        ]
      }
      return {
        ...state,
        simulator: {
          ...state.simulator,
          messages
        }
      };

    case 'clear':
      return {
        ...state,
        simulator: {
          ...state.simulator,
          messages: {
            ...state.messages,
            [action.transport]: []
          }
        }
      };

    case 'globals':
      // set globals
      return {
        ...state,
        simulator: {
          ...state.simulator,
          globals: action.globals
        }
      };

    case 'params':
      const { params } = action;
      return {
        ...state,
        simulator: {
          ...state.simulator,
          transport: params.chatBot.transport,
          nodeId: params.chatBot.nodeId,
          language: params.language,
          user: params.user
        }
      };

    default:
      return state;
  }
};

export default handleMessages;