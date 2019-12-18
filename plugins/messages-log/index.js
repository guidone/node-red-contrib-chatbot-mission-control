import React, { useState, Fragment } from 'react';
import _ from 'lodash';
import { Button, Form, FormControl, ButtonToolbar, FormGroup, ControlLabel, Tag, List, FlexboxGrid } from 'rsuite';

import { plug } from '../../lib/code-plug';
import withState from '../../src/wrappers/with-state';
import withSocket from '../../src/wrappers/with-socket';
import Panel from '../../src/components/grid-panel';
import { WidgetForm, Content, Footer } from '../../src/components/widget-form';
import moment from 'moment';

import './message-log.scss';

const colorType = type => {
  switch(type) {
    case 'message': return 'cyan';
    case 'document':
    case 'photo':
    case 'video':
    case 'sticker':
      return 'orange';
    default: return 'grey';
  }
}

function humanFileSize(bytes, si = true) {
  var thresh = si ? 1000 : 1024;
  if(Math.abs(bytes) < thresh) {
      return bytes + ' B';
  }
  var units = si
      ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
      : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
  var u = -1;
  do {
      bytes /= thresh;
      ++u;
  } while(Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1)+' '+units[u];
}

const Preview = ({ content }) => {
  if (_.isString(content)) {
    return <Fragment>{content}</Fragment>;
  } else if (_.isObject(content) && content.type === 'Buffer') {
    return <Fragment>Buffer <span className="file-size"> ({humanFileSize(content.data.length)})</span></Fragment>;
  } else {
    return <Fragment>Unknown content</Fragment>;
  }

}


const MessageLogWidget = ({ messageLog = [] }) => {
   
  console.log('I am the messageLog', messageLog)

  return (
    <Panel title="Message Log" className="widget-message-log" scrollable>
      {messageLog.length === 0 && (
        <div>empty</div>
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

const handleMessages = (state, action) => {
  switch(action.type) {
    case 'socket.message':
      if (action.topic === 'message.sent') {
        const payload = _.isArray(action.payload) ? action.payload : [action.payload];
        console.log('message was sent', action.payload)
        const messages = payload.map(message => ({ ...message, ts: moment() }));
        const messageLog = state.messageLog != null ? [...messages, ...state.messageLog] : messages;
        return {
          ...state,
          messageLog
        }; 
      }
      return state;
    default:
      return state; 
  }

};

// todo min size 3
plug('reducers', handleMessages);
plug('widgets', withState(MessageLogWidget, ['messageLog']), { x: 1, y: 0, w: 2, h: 4, minW: 2, isResizable: true, id: 'message-log' })




