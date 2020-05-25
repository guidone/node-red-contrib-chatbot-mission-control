import React from 'react';
import { Button, Notification, Schema } from 'rsuite';
import _ from 'lodash';

import { useModal } from '../../../src/components/modal';
import useSocket from '../../../src/hooks/socket';
import useGlobals from '../../../src/hooks/globals';
import name from '../../../src/helpers/user/readable-name';

import SendMessageForm from './send-form';

const isValidMessage = value => value.recipient != null && value.chatId  != null && value.botNode != null && !_.isEmpty(value.message);

const { StringType, ObjectType } = Schema.Types;
const messageModel = Schema.Model({
  recipient: ObjectType()
    .isRequired('Select recipient'),
  botNode: StringType()
    .isRequired('Select chatbot platoform'),
  message: StringType()
    .isRequired('Enter message for the user')
});


const SendMessageButton = ({ user, appearance = 'ghost', transport }) => {
  const { sendMessage } = useSocket();
  const { activeChatbots } = useGlobals();
  const { open, close, validate, error, disable, openWithModel, openWith } = useModal({
    view: SendMessageForm,
    title: 'Send message',
    labelSubmit: 'Send message',
    size: 'sm',
    //enableSummit: isValidMessage
  });

  let botNode;
  let chatId;
  if (!_.isEmpty(transport)) {
    // TODO predefine transport if needed
    const hasChatId = user.chatIds.some(item => item.transport === transport);

    if (hasChatId) {
      const chatBot = activeChatbots.find(chatBot => chatBot.transport === transport);
      console.log('chatBot', chatBot, activeChatbots, transport)
      if (chatBot != null) {
        botNode = chatBot.nodeId;
        chatId = user.chatIds.find(item => item.transport === transport).chatId;
      }
    }
  }


  return (
    <Button
      appearance={appearance}
      onClick={async () => {
        let msg = { recipient: user, botNode, chatId, message: '' };

        //msg = await openWithModel(msg, messageModel);
        msg = await openWith(msg, isValidMessage);
        if (msg) {
          sendMessage('message.send', msg);
          Notification.success({
            title: 'Message sent',
            description: `Message sent successfully to "${name(msg.recipient)}"`
          });
        }
      }}
    >Contact User</Button>
  );
};

export default SendMessageButton;