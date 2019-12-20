import React, { Fragment } from 'react';
import { Tag, List, FlexboxGrid } from 'rsuite';

import humanFileSize from '../helpers/human-file-size';
import colorType from '../helpers/color-type';
import useTimedReRender from '../../../src/hooks/timed-rerender';

const Preview = ({ content }) => {
  if (_.isString(content)) {
    return <Fragment>{content}</Fragment>;
  } else if (_.isObject(content) && content.type === 'Buffer') {
    return <Fragment>Buffer <span className="file-size"> ({humanFileSize(content.data.length)})</span></Fragment>;
  } else {
    return <Fragment>Unknown content</Fragment>;
  }
}





const MessageList = ({ messages = [] }) => {
  useTimedReRender(6e4);

  return (
    <List hover autoScroll size="sm">
      {messages.map((message, index) => (
        <List.Item key={index} index={index}>
          <FlexboxGrid>
            <FlexboxGrid.Item colspan={3} className="ellipsis cell-date">
              {message.ts.fromNow()}
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={3} className="cell-type">
              <Tag color={colorType(message.type)}>{message.type}</Tag>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={3} className="cell-chat-id ellipsis">
              {message.chatId}
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={15} className="ellipsis cell-content">
              <Preview content={message.content}/>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </List.Item>
      ))}
    </List>
  )
};

export default MessageList;
