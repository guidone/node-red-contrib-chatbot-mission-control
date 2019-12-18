import React, { Fragment } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Icon, IconButton, Tag, List, FlexboxGrid } from 'rsuite';

import { plug } from '../../lib/code-plug';
import Panel from '../../src/components/grid-panel';
import useSocket from '../../src/hooks/socket';

import './message-log.scss';
import humanFileSize from './helpers/human-file-size';
import colorType from './helpers/color-type';

const handleMessages = (state, action) => {
  switch(action.type) {
    case 'socket.message':
      if (action.topic === 'message.log') {
        const payload = _.isArray(action.payload) ? action.payload : [action.payload];
        const messages = payload.map(message => ({ ...message, ts: moment() }));
        const messageLog = state.messageLog != null ? [...messages, ...state.messageLog] : messages;
        return {
          ...state,
          messageLog
        }; 
      }
      return state;
    case 'clear':
      return {
        ...state,
        messageLog: []
      }; 
    default:
      return state; 
  }
};

const Preview = ({ content }) => {
  if (_.isString(content)) {
    return <Fragment>{content}</Fragment>;
  } else if (_.isObject(content) && content.type === 'Buffer') {
    return <Fragment>Buffer <span className="file-size"> ({humanFileSize(content.data.length)})</span></Fragment>;
  } else {
    return <Fragment>Unknown content</Fragment>;
  }
}

const MessageLogWidget = () => {   
  const { state, dispatch } = useSocket(handleMessages, { messageLog: [] });
  const { messageLog } = state;

  return (
    <Panel 
      title="Message Log" 
      className="widget-message-log"
      menu={<IconButton onClick={() => dispatch({ type: 'clear' })} appearance="link" icon={<Icon icon="trash"/>} size="md"/>} 
      scrollable
    >
      {messageLog.length === 0 && (
        <Panel.Empty>No messages</Panel.Empty>
      )}
      {messageLog.length !== 0 && (
        <List hover autoScroll size="sm">
          {messageLog.map((message, index) => (
            <List.Item key={index} index={index}>
              <FlexboxGrid>
                <FlexboxGrid.Item colspan={3} className="ellipsis cell-date">
                  {message.ts.fromNow()}
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={3}>
                  <Tag color={colorType(message.type)}>{message.type}</Tag>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={3} className="cell-chat-id">
                  {message.chatId}
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={15} className="ellipsis cell-content">
                  <Preview content={message.content}/>
                </FlexboxGrid.Item>
              </FlexboxGrid>
            </List.Item>
          ))}
        </List>
      )}
      
    </Panel>
  );
}

plug('widgets', MessageLogWidget, { x: 0, y: 0, w: 2, h: 4, minW: 2, isResizable: true, id: 'message-log' })




