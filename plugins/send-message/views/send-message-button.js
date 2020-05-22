import React from 'react';
import { Button, Notification } from 'rsuite';

import { useModal } from '../../../src/components/modal';
import useSocket from '../../../src/hooks/socket';
import name from '../../../src/helpers/user/readable-name';



const time = seconds => new Promise(resolve => setTimeout(() => resolve(), seconds * 1000));

import SendMessageForm from './send-form';






const SendMessageButton = ({ user }) => {
  const { sendMessage } = useSocket();
  const { open, close, error, disable } = useModal({
    view: SendMessageForm,
    title: 'Send Message',
    labelSubmit: 'Send',
    size: 'sm'
  });

  return (
    <Button
      appearance="ghost"
      onClick={async () => {
        let msg = await open({ recipient: user })
        close();
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